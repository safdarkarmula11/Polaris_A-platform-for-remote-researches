/*
 * Outreach Kit (structure doc §9).
 *
 * Every section below is computed from fields that already
 * exist in the locked schema (bibliographic, content, taxonomy,
 * outreach, evidence[], pipeline) — nothing here reads a field
 * that isn't in ncpor_paper_schema_final.md, and nothing is
 * persisted. This keeps the schema untouched while still
 * producing the ten kit pieces the structure doc calls for.
 *
 * Two pieces the full spec calls for — Relevant Images and
 * Relevant Videos — have no backing field in the schema
 * (papers don't carry linked media), so those sections report
 * "not available" rather than inventing placeholder content.
 *
 * "AI prepares the material, the creator makes the final call"
 * (§9): everything here is raw, sourced building blocks, never
 * a finished caption or post.
 */

function formatCitation(paper) {
  const authors = Array.isArray(paper?.bibliographic?.authors)
    ? paper.bibliographic.authors
        .map((author) => author?.name)
        .filter(Boolean)
    : [];

  const authorString =
    authors.length > 0 ? authors.join(", ") : "Unknown Author";

  const year = paper?.bibliographic?.year || "n.d.";
  const title = paper?.bibliographic?.title || "Untitled";
  const series = paper?.bibliographic?.publication_series;
  const pages = paper?.bibliographic?.page_range;

  let citation = `${authorString} (${year}). ${title}.`;

  if (series) {
    citation += ` ${series}.`;
  }

  if (pages) {
    citation += ` pp. ${pages}.`;
  }

  return citation;
}

function buildKeyFacts(paper) {
  const facts = [];

  if (paper?.bibliographic?.expedition) {
    facts.push({
      label: "Expedition",
      value: paper.bibliographic.expedition,
    });
  }

  if (paper?.taxonomy?.category) {
    facts.push({
      label: "Field of study",
      value: [
        paper.taxonomy.category,
        paper.taxonomy.subcategory,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  if (
    Array.isArray(paper?.content?.research_sites) &&
    paper.content.research_sites.length > 0
  ) {
    facts.push({
      label: "Research sites",
      value: paper.content.research_sites.join(", "),
    });
  }

  if (paper?.bibliographic?.year) {
    facts.push({
      label: "Year",
      value: String(paper.bibliographic.year),
    });
  }

  if (paper?.bibliographic?.report_type) {
    facts.push({
      label: "Document type",
      value: paper.bibliographic.report_type,
    });
  }

  return facts;
}

function buildInterestingNumbers(paper) {
  const numbers = [];

  if (paper?.bibliographic?.year) {
    numbers.push({
      value: String(paper.bibliographic.year),
      label: "Year published",
    });
  }

  if (paper?.content?.num_pages) {
    numbers.push({
      value: String(paper.content.num_pages),
      label: "Pages",
    });
  }

  if (Array.isArray(paper?.content?.research_sites)) {
    numbers.push({
      value: String(paper.content.research_sites.length),
      label: "Research sites",
    });
  }

  if (Array.isArray(paper?.evidence)) {
    numbers.push({
      value: String(paper.evidence.length),
      label: "Verified evidence points",
    });
  }

  return numbers;
}

function buildWhyItMatters(paper) {
  const category = paper?.taxonomy?.category;
  const sites = Array.isArray(paper?.content?.research_sites)
    ? paper.content.research_sites
    : [];
  const expedition = paper?.bibliographic?.expedition;

  const parts = [];

  if (category) {
    parts.push(
      `This record contributes to India's ${category.toLowerCase()} research`
    );
  } else {
    parts.push("This record contributes to India's polar research");
  }

  if (sites.length > 0) {
    parts.push(`in and around ${sites.join(", ")}`);
  }

  if (expedition) {
    parts.push(`as part of the ${expedition}`);
  }

  return `${parts.join(" ")}. Use this as a starting point — pair it with the summary and evidence below for the full context.`;
}

function buildStoryAngles(paper) {
  const angles = [];

  const sites = Array.isArray(paper?.content?.research_sites)
    ? paper.content.research_sites
    : [];

  if (sites.length > 0) {
    angles.push({
      title: "The Place",
      description: `Anchor the story in ${sites[0]} — where the research actually happened.`,
    });
  }

  if (paper?.bibliographic?.expedition) {
    angles.push({
      title: "The Expedition",
      description: `Frame it as part of the ${paper.bibliographic.expedition} — a chapter in a longer scientific journey.`,
    });
  }

  if (paper?.bibliographic?.year) {
    const age =
      new Date().getFullYear() - Number(paper.bibliographic.year);
    if (age > 0) {
      angles.push({
        title: "The Timeline",
        description: `This research is ${age} year${
          age === 1 ? "" : "s"
        } old — what's changed since, or still holds true?`,
      });
    }
  }

  if (Array.isArray(paper?.evidence) && paper.evidence.length > 0) {
    angles.push({
      title: "The Evidence",
      description:
        "Show the receipts — quote the verified source text directly to build trust with a skeptical audience.",
    });
  }

  return angles;
}

export function buildOutreachKit(paper) {
  if (!paper) {
    return null;
  }

  return {
    simpleExplanation:
      paper?.content?.summary ||
      "No plain-language summary available for this record yet.",
    keyFacts: buildKeyFacts(paper),
    interestingNumbers: buildInterestingNumbers(paper),
    whyItMatters: buildWhyItMatters(paper),
    storyAngles: buildStoryAngles(paper),
    verifiedEvidence: Array.isArray(paper?.evidence)
      ? paper.evidence
      : [],
    relevantImages: null, // not in schema — see file header
    relevantVideos: null, // not in schema — see file header
    originalResearch: {
      pdfUrl: paper?.pdf_url || null,
      sourceFile: paper?.source_file || null,
    },
    citation: formatCitation(paper),
  };
}