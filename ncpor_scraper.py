import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
import os

# Base URL of the NCAOR DSpace server
BASE_URL = "http://14.139.119.23:8080"

# Start at the main community page, or target a specific expedition
START_URL = "http://14.139.119.23:8080/dspace/index.jsp"

# Sets to keep track of what we've processed
visited_urls = set()

# Root of the hierarchy tree we build up as we crawl.
# Each node looks like: {"children": {label: node, ...}, "pdfs": [(name, url), ...]}
tree = {"children": {}, "pdfs": []}


def get_links_from_page(url):
    """Fetches the page and returns a list of (link_text, absolute_url) tuples."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                      '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        links = []
        for a_tag in soup.find_all('a', href=True):
            text = a_tag.get_text(strip=True)
            href = urljoin(BASE_URL, a_tag['href'])
            links.append((text, href))
        return links
    except requests.RequestException as e:
        print(f"[-] Error fetching {url}: {e}")
        return []


def pdf_name_from(text, url):
    """Pick a sensible display name for a found PDF link."""
    if text:
        return text
    # Fall back to the last path segment of the URL
    name = url.rstrip('/').split('/')[-1]
    return name if name else url


def crawl_dspace(current_url, node, max_depth=5, current_depth=0):
    """
    Recursively crawls DSpace pages searching for bitstream/PDF links.
    DSpace hierarchy: Community -> Collection -> Item -> Bitstream (PDF)

    `node` is the tree node (dict) that corresponds to current_url; any PDFs
    found directly on this page get attached to it, and any sub-pages we
    descend into become child nodes keyed by their link text.
    """
    if current_depth > max_depth or current_url in visited_urls:
        return

    visited_urls.add(current_url)
    print(f"Scraping (Depth {current_depth}): {current_url}")

    links = get_links_from_page(current_url)

    for text, link in links:
        # 1. PDF / bitstream link -> attach to the current node
        if '/bitstream/' in link or link.lower().endswith('.pdf'):
            name = pdf_name_from(text, link)
            if (name, link) not in node["pdfs"]:
                node["pdfs"].append((name, link))
                print(f"    [+] FOUND PDF: {name} -> {link}")

        # 2. Deeper hierarchy link (community/collection/item) -> recurse into a child node
        elif '/dspace/handle/' in link:
            if link == "http://14.139.119.23:8080/dspace/community-list":
                continue

            label = text if text else link
            child = node["children"].setdefault(label, {"children": {}, "pdfs": []})
            crawl_dspace(link, child, max_depth, current_depth + 1)

    # Be polite to the server and avoid sending too many requests at once
    time.sleep(1)


def count_pdfs(node):
    total = len(node["pdfs"])
    for child in node["children"].values():
        total += count_pdfs(child)
    return total


def write_tree(file, node, depth=0, expedition_counter=None):
    """
    Recursively writes the tree to `file` in an indented, organized format:

    Expedition 1:
        Subtopic1:
            pdf name: http://...
        Subtopic2:
            pdf name: http://...
    Expedition 2:
        ...

    Top-level nodes (depth 0) are labeled "Expedition N:" using their crawl
    order; nodes below that keep their own link text as the label.
    """
    indent = "    " * depth

    for label, child in node["children"].items():
        if depth == 0:
            expedition_counter[0] += 1
            heading = f"Expedition {expedition_counter[0]}: {label}"
        else:
            heading = f"{label}:"

        file.write(f"{indent}{heading}\n")

        for name, url in child["pdfs"]:
            file.write(f"{indent}    {name}: {url}\n")

        write_tree(file, child, depth + 1, expedition_counter)


if __name__ == "__main__":
    print(f"Starting crawl at: {START_URL}")
    print("-" * 50)

    # max_depth=3 is usually enough to go from Community -> Collection -> Item
    crawl_dspace(START_URL, tree, max_depth=3)

    print("-" * 50)
    total_pdfs = count_pdfs(tree)
    print(f"Crawl finished. Found {total_pdfs} PDF(s).")

    # Save the links to a text file, organized by hierarchy
    if total_pdfs:
        out_path = "expedition_pdfs.txt"
        with open(out_path, "w") as file:
            write_tree(file, tree, depth=0, expedition_counter=[0])
        print(f"Saved organized PDF links to '{out_path}'.")
    else:
        print("No PDFs found; nothing written.")
