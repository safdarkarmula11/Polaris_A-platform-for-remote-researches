#!/usr/bin/env python3
"""
pdf_text_extractor.py

Accepts a URL (pointing to a PDF file, e.g. an http:// URL), downloads the
PDF, extracts all text from it, and prints the text to the terminal.

Requirements:
    pip install requests pypdf

Usage:
    python pdf_text_extractor.py
    (then paste the URL when prompted)
"""

import sys
import io
import requests
from pypdf import PdfReader


def download_pdf(url: str) -> bytes:
    """Download the PDF content from the given URL and return raw bytes."""
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; PDFTextExtractor/1.0)"
    }
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "").lower()
    if "pdf" not in content_type and not url.lower().endswith(".pdf"):
        print(
            f"Warning: content type is '{content_type}', "
            "which doesn't look like a PDF. Attempting to parse anyway..."
        )

    return response.content


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract and return all text from the given PDF bytes."""
    reader = PdfReader(io.BytesIO(pdf_bytes))

    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception:
            print("Error: PDF is encrypted and could not be decrypted.")
            sys.exit(1)

    all_text = []
    for page_num, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        all_text.append(f"--- Page {page_num} ---\n{text}")

    return "\n\n".join(all_text)


def main():
    url = input("Enter the URL of the PDF: ").strip()

    if not url:
        print("Error: no URL provided.")
        sys.exit(1)

    if not (url.startswith("http://") or url.startswith("https://")):
        print("Error: please provide a valid URL starting with http:// or https://")
        sys.exit(1)

    print(f"\nDownloading PDF from: {url}")
    try:
        pdf_bytes = download_pdf(url)
    except requests.exceptions.RequestException as e:
        print(f"Error downloading PDF: {e}")
        sys.exit(1)

    print("Extracting text...\n")
    try:
        text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        sys.exit(1)

    if not text.strip():
        print("No extractable text was found in this PDF (it may be scanned/image-based).")
    else:
        print("=" * 60)
        print("EXTRACTED TEXT")
        print("=" * 60)
        print(text)


if __name__ == "__main__":
    main()
