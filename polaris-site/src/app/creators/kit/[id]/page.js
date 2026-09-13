import Link from "next/link";
import { notFound } from "next/navigation";
import { getResearchById } from "@/lib/research";
import { buildOutreachKit } from "@/lib/outreachKit";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function OutreachKitPage({ params }) {
  const { id } = await params;

  const paper = getResearchById(id);

  if (!paper) {
    notFound();
  }

  const kit = buildOutreachKit(paper);

  return (
    <main className="polaris-site paper-page">
      <Navbar />

      <div className="paper-topbar">
        <div className="paper-container">
          <div className="paper-topbar-left">
            <Link
              href={`/research/${paper.id}`}
              className="paper-back"
            >
              ← BACK TO RECORD
            </Link>
            <span className="paper-record-id">
              OUTREACH KIT
            </span>
          </div>
        </div>
      </div>

      <section className="paper-header">
        <div className="paper-container">
          <div className="paper-breadcrumb">
            <span>OUTREACH KIT</span>
            <i>/</i>
            <span>
              {paper?.taxonomy?.category || "Unclassified"}
            </span>
          </div>

          <h1>
            {paper?.bibliographic?.title || "Untitled Research"}
          </h1>

          <p className="paper-muted">
            AI prepares the material below from this record&apos;s
            verified data. You decide how to tell the story.
          </p>
        </div>
      </section>

      {/* 1. Simple Explanation */}
      <section className="paper-summary">
        <div className="paper-container paper-two-column">
          <div className="paper-section-label">
            <span>01</span> SIMPLE EXPLANATION
          </div>
          <div className="paper-summary-content">
            <p>{kit.simpleExplanation}</p>
          </div>
        </div>
      </section>

      {/* 2. Key Facts */}
      <section className="paper-context">
        <div className="paper-container">
          <div className="paper-section-heading">
            <span>02</span> KEY FACTS
          </div>

          {kit.keyFacts.length > 0 ? (
            <div className="paper-context-grid">
              {kit.keyFacts.map((fact) => (
                <div
                  className="paper-context-block"
                  key={fact.label}
                >
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="paper-no-data">
              No key facts could be derived for this record.
            </div>
          )}
        </div>
      </section>

      {/* 3. Interesting Numbers */}
      <section className="paper-abstract">
        <div className="paper-container">
          <div className="paper-section-heading">
            <span>03</span> INTERESTING NUMBERS
          </div>

          {kit.interestingNumbers.length > 0 ? (
            <div className="kit-numbers-row">
              {kit.interestingNumbers.map((number) => (
                <div
                  className="kit-number-item"
                  key={number.label}
                >
                  <strong>{number.value}</strong>
                  <span>{number.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="paper-no-data">
              No numeric highlights available.
            </div>
          )}
        </div>
      </section>

      {/* 4. Why It Matters */}
      <section className="paper-summary">
        <div className="paper-container paper-two-column">
          <div className="paper-section-label">
            <span>04</span> WHY IT MATTERS
          </div>
          <div className="paper-summary-content">
            <p>{kit.whyItMatters}</p>
          </div>
        </div>
      </section>

      {/* 5. Story Angles */}
      <section className="paper-context">
        <div className="paper-container">
          <div className="paper-section-heading">
            <span>05</span> STORY ANGLES
          </div>

          {kit.storyAngles.length > 0 ? (
            <div className="paper-context-grid">
              {kit.storyAngles.map((angle) => (
                <div
                  className="paper-context-block"
                  key={angle.title}
                >
                  <span>{angle.title.toUpperCase()}</span>
                  <p className="paper-muted">
                    {angle.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="paper-no-data">
              No story angles could be derived for this record.
            </div>
          )}
        </div>
      </section>

      {/* 6. Verified Evidence */}
      <section className="paper-evidence">
        <div className="paper-container">
          <div className="paper-section-heading">
            <span>06</span> VERIFIED EVIDENCE
          </div>

          {kit.verifiedEvidence.length > 0 ? (
            <div className="paper-evidence-list">
              {kit.verifiedEvidence.map((item, index) => (
                <article
                  className="evidence-card"
                  key={`${item.field}-${index}`}
                >
                  <span className="evidence-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="evidence-content">
                    <span className="evidence-label">
                      <i>SUPPORTS</i> {item.field}
                    </span>
                    <blockquote>
                      &ldquo;{item.source_text}&rdquo;
                    </blockquote>
                    <span className="evidence-source">
                      Page {item.page_number} · {item.section}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="paper-no-data">
              No verified evidence recorded for this paper.
            </div>
          )}
        </div>
      </section>

      {/* 7 & 8. Relevant Images / Videos */}
      <section className="paper-context">
        <div className="paper-container">
          <div className="paper-section-heading">
            <span>07–08</span> RELEVANT IMAGES &amp; VIDEOS
          </div>

          <div className="paper-no-data">
            Papers in this archive don&apos;t yet carry linked
            media. This section will populate automatically
            once photo and video archives are connected to
            research records.
          </div>
        </div>
      </section>

      {/* 9. Original Research */}
      <section className="paper-original">
        <div className="paper-container">
          <div className="paper-original-inner">
            <div>
              <span className="paper-original-label">
                09 · ORIGINAL RESEARCH
              </span>
              <h2>Go back to the source</h2>
              <p>
                Every claim in this kit traces back to the
                original document. Link to it, don&apos;t just
                summarize it.
              </p>
            </div>

            {kit.originalResearch.pdfUrl ? (
            <a
                href={kit.originalResearch.pdfUrl}
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
          </div>
        </div>
      </section>

      {/* 10. Citation */}
      <section className="paper-provenance">
        <div className="paper-container">
          <div className="paper-section-heading">
            <span>10</span> CITATION
          </div>

          <div className="kit-citation-block">
            <p>{kit.citation}</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}