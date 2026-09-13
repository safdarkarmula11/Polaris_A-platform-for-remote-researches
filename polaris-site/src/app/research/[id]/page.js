import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getResearchById,
  getRelatedResearch,
} from "@/lib/research";

export default async function ResearchPaperPage({ params }) {
  const { id } = await params;

  const paper = getResearchById(id);

  if (!paper) {
    notFound();
  }

  const display = paper.display || {};
  const bibliographic = paper.bibliographic || {};
  const content = paper.content || {};
  const taxonomy = paper.taxonomy || {};
  const pipeline = paper.pipeline || {};

  const evidence = Array.isArray(paper.evidence)
    ? paper.evidence
    : [];

  const authors = Array.isArray(bibliographic.authors)
    ? bibliographic.authors
    : [];

  const keywords = Array.isArray(content.keywords)
    ? content.keywords
    : [];

  const sites = Array.isArray(content.research_sites)
    ? content.research_sites
    : [];

  const tags = Array.isArray(taxonomy.tags)
    ? taxonomy.tags
    : [];

  const confidence =
    pipeline.confidence &&
    typeof pipeline.confidence === "object"
      ? pipeline.confidence
      : {};

  const related = getRelatedResearch(paper, 4);

  return (
    <main className="paper-page">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <div className="paper-topbar">
        <div className="paper-container">

          <div className="paper-topbar-left">

            <Link
              href="/"
              className="back-home-button"
            >
              <span>←</span>
              BACK TO HOME
            </Link>

            <Link
              href="/research"
              className="paper-back"
            >
              ← BACK TO RESEARCH
            </Link>

          </div>

          <span className="paper-record-id">
            RECORD / {paper.id || "—"}
          </span>

        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="paper-header">
        <div className="paper-container">

          <div className="paper-breadcrumb">
            <span>RESEARCH</span>
            <i>/</i>

            <span>
              {display.category || "UNCLASSIFIED"}
            </span>

            <i>/</i>

            <span>
              {display.subcategory || "RESEARCH"}
            </span>
          </div>

          <h1>
            {display.title ||
              bibliographic.title ||
              "Untitled Research"}
          </h1>

          <div className="paper-meta-grid">

            <Meta
              label="EXPEDITION"
              value={
                bibliographic.expedition ||
                display.expedition ||
                "—"
              }
            />

            <Meta
              label="YEAR"
              value={
                bibliographic.year ||
                display.year ||
                "—"
              }
            />

            <Meta
              label="REPORT TYPE"
              value={
                bibliographic.report_type ||
                "—"
              }
            />

            <Meta
              label="PAGES"
              value={
                content.num_pages
                  ? String(content.num_pages)
                  : "—"
              }
            />

          </div>

          {authors.length > 0 && (
            <div className="paper-authors">

              <span>AUTHORS</span>

              <p>
                {authors
                  .map((author) => {
                    if (typeof author === "string") {
                      return author;
                    }

                    if (
                      author &&
                      typeof author === "object"
                    ) {
                      return (
                        author.name ||
                        "Unknown Author"
                      );
                    }

                    return "Unknown Author";
                  })
                  .join(", ")}
              </p>

            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="paper-summary">
        <div className="paper-container paper-two-column">

          <div className="paper-section-label">
            <span>01</span>
            PLAIN-LANGUAGE SUMMARY
          </div>

          <div className="paper-summary-content">

            <p>
              {content.summary ||
                display.summary ||
                "No summary available."}
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          RESEARCH CONTEXT
      ===================================================== */}

      <section className="paper-context">
        <div className="paper-container">

          <div className="paper-section-heading">
            <span>02</span>
            RESEARCH CONTEXT
          </div>

          <div className="paper-context-grid">

            <ContextBlock
              title="RESEARCH SITES"
              items={sites}
              linkParam="site"
            />

            <ContextBlock
              title="KEYWORDS"
              items={keywords}
              hashtag
            />

            <ContextBlock
              title="TAXONOMY"
              items={[
                taxonomy.category,
                taxonomy.subcategory,
                ...tags,
              ].filter(Boolean)}
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          ABSTRACT
      ===================================================== */}

      <section className="paper-abstract">
        <div className="paper-container paper-two-column">

          <div className="paper-section-label">
            <span>03</span>
            ABSTRACT
          </div>

          <div className="paper-abstract-content">

            {content.abstract ? (
              <p>{content.abstract}</p>
            ) : (
              <p className="paper-muted">
                No abstract available in the
                extracted record.
              </p>
            )}

          </div>

        </div>
      </section>

      {/* =====================================================
          AI CLASSIFICATION
      ===================================================== */}

      <section className="paper-ai">
        <div className="paper-container">

          <div className="paper-section-heading">
            <span>04</span>
            AI CLASSIFICATION
          </div>

          <div className="paper-ai-grid">

            <ConfidenceCard
              label="CATEGORY"
              value={taxonomy.category}
              confidence={
                confidence.category
              }
            />

            <ConfidenceCard
              label="SUBCATEGORY"
              value={taxonomy.subcategory}
              confidence={
                confidence.subcategory
              }
            />

            <ConfidenceCard
              label="TAGS"
              value={
                tags.length
                  ? tags.join(", ")
                  : "—"
              }
              confidence={
                confidence.tags
              }
            />

          </div>

          <div className="paper-ai-note">

            <span>METHOD</span>

            <p>
              Classification shown here is retained
              from the structured extraction pipeline.
              Confidence values are displayed only when
              present in the source record.
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          EVIDENCE
      ===================================================== */}

      <section className="paper-evidence">
        <div className="paper-container">

          <div className="paper-section-heading">
            <span>05</span>
            EVIDENCE
          </div>

          {evidence.length > 0 ? (
            <div className="paper-evidence-list">

              {evidence.map((item, index) => (
                <EvidenceCard
                  key={index}
                  item={item}
                  index={index}
                />
              ))}

            </div>
          ) : (
            <div className="paper-no-data">
              No evidence entries are available
              in this extracted record.
            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          PROVENANCE
      ===================================================== */}

      <section className="paper-provenance">
        <div className="paper-container">

          <div className="paper-section-heading">
            <span>06</span>
            PROVENANCE
          </div>

          <div className="provenance-grid">

            <Provenance
              label="SOURCE FILE"
              value={
                paper.source_file ||
                "—"
              }
            />

            <Provenance
              label="DOCUMENT ID"
              value={
                paper.document_id ||
                "—"
              }
            />

            <Provenance
              label="PUBLICATION"
              value={
                bibliographic.publication_series ||
                "—"
              }
            />

            <Provenance
              label="PAGE RANGE"
              value={
                bibliographic.page_range ||
                "—"
              }
            />

            <Provenance
              label="DOI"
              value={
                bibliographic.doi ||
                "—"
              }
            />

            <Provenance
              label="LANGUAGE"
              value={
                bibliographic.language ||
                "—"
              }
            />

            <Provenance
              label="PIPELINE STATUS"
              value={
                pipeline.status ||
                "—"
              }
            />

            <Provenance
              label="REVIEWED"
              value={
                pipeline.reviewed === true
                  ? "YES"
                  : pipeline.reviewed === false
                    ? "NO"
                    : "—"
              }
            />

          </div>

        </div>
      </section>

            {/* =====================================================
          RELATED CONTENT
      ===================================================== */}

      <section className="paper-related">
        <div className="paper-container">

          <div className="paper-section-heading">
            <span>07</span>
            RELATED CONTENT
          </div>

          {related.length > 0 ? (
            <div className="related-grid">

              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/research/${item.id}`}
                  className="related-card"
                >

                  <span className="related-card-category">
                    {item.taxonomy?.category || "Unclassified"}
                  </span>

                  <h3>
                    {item.display?.title ||
                      item.bibliographic?.title ||
                      "Untitled Research"}
                  </h3>

                  <span className="related-card-meta">
                    {item.bibliographic?.expedition ||
                      "Unknown Expedition"}
                    {item.bibliographic?.year
                      ? ` · ${item.bibliographic.year}`
                      : ""}
                  </span>

                </Link>
              ))}

            </div>
          ) : (
            <div className="paper-no-data">
              No related records found for this paper yet.
            </div>
          )}

        </div>
      </section>

      {/* =====================================================
          ORIGINAL DOCUMENT
      ===================================================== */}

      <section className="paper-original">
        <div className="paper-container">

          <div className="paper-original-inner">

            <div>

              <span className="paper-original-label">
                SOURCE DOCUMENT
              </span>

              <h2>
                Read the original research
              </h2>

              <p>
                Access the source document associated
                with this extracted research record.
              </p>

            </div>

                        <div className="paper-original-actions">
              {paper.pdf_url ? (
                <a
                  href={paper.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="paper-pdf-button"
                >
                  OPEN ORIGINAL PDF
                  <span>↗</span>
                </a>
              ) : (
                <span className="paper-pdf-disabled">
                  PDF NOT AVAILABLE
                </span>
              )}

              <Link
                href={`/creators/kit/${paper.id}`}
                className="paper-kit-button"
              >
                GENERATE OUTREACH KIT
                <span>→</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}


/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function Meta({ label, value }) {
  return (
    <div className="paper-meta">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


function ContextBlock({
  title,
  items = [],
  hashtag = false,
  linkParam = null,
}) {
  return (
    <div className="paper-context-block">

      <span>{title}</span>

      {items.length > 0 ? (
        <div className="paper-context-items">

          {items.map((item, index) =>
            linkParam ? (
              <Link
                key={`${item}-${index}`}
                href={`/research?${linkParam}=${encodeURIComponent(
                  item
                )}`}
              >
                {hashtag ? `#${item}` : item}
              </Link>
            ) : (
              <span key={`${item}-${index}`}>
                {hashtag ? `#${item}` : item}
              </span>
            )
          )}

        </div>
      ) : (
        <p className="paper-muted">
          No data available.
        </p>
      )}
    </div>
  );
}


function ConfidenceCard({
  label,
  value,
  confidence,
}) {
  const numeric =
    typeof confidence === "number"
      ? confidence
      : null;

  return (
    <div className="confidence-card">

      <div className="confidence-top">

        <span>{label}</span>

        {numeric !== null && (
          <strong>
            {numeric <= 1
              ? `${Math.round(numeric * 100)}%`
              : `${Math.round(numeric)}%`}
          </strong>
        )}

      </div>

      <div className="confidence-value">
        {value || "Not classified"}
      </div>

      {numeric !== null && (
        <div className="confidence-bar">

          <span
            style={{
              width: `${
                numeric <= 1
                  ? numeric * 100
                  : numeric
              }%`,
            }}
          />

        </div>
      )}

    </div>
  );
}


function EvidenceCard({
  item,
  index,
}) {
  const sourceText =
    item?.source_text ||
    item?.text ||
    "Evidence text unavailable.";

  const page =
    item?.page_number ??
    item?.page ??
    null;

  const field =
    item?.field ||
    "SOURCE EVIDENCE";

  const section =
    item?.section ||
    null;

  return (
    <article className="evidence-card">

      <div className="evidence-number">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="evidence-content">

        <div className="evidence-label">

          <span>{field}</span>

          {section && (
            <>
              <i>/</i>
              <span>{section}</span>
            </>
          )}

        </div>

        <blockquote>
          {sourceText}
        </blockquote>

        <div className="evidence-source">

          {page !== null && (
            <span>
              PAGE {page}
            </span>
          )}

          <span>
            SOURCE EVIDENCE
          </span>

        </div>

      </div>

    </article>
  );
}


function Provenance({
  label,
  value,
}) {
  return (
    <div className="provenance-item">

      <span>{label}</span>

      <strong>
        {value}
      </strong>

    </div>
  );
}