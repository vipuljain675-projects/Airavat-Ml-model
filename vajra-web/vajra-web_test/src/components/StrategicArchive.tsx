"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Search,
  X,
} from "lucide-react";

type ArchiveRecord = {
  id?: string;
  event_id?: string;
  title?: string;
  summary?: string;
  scenario?: string;
  date?: string;
  actors?: string[];
  targets?: string[];
  regions?: string[];
  event_types?: string[];
  image?: string | null;
  deep_dive?: Record<string, unknown> | null;
  notes?: string;
  keywords?: string;
  leading_indicators?: string[];
  follow_on_risks?: string[];
  retaliatory_risks?: string[];
  countermeasures?: string[];
  source_refs?: string[];
  source_reliability?: number;
  confidence?: number;
};

type DossierPage = {
  title: string;
  kicker: string;
  body: string[];
};

type Dossier = {
  id: string;
  title: string;
  summary: string;
  scenario: string;
  date: string;
  actors: string[];
  targets: string[];
  regions: string[];
  eventTypes: string[];
  image?: string | null;
  notes: string;
  keywords: string;
  countermeasures: string[];
  sourceReliability: number;
  confidence: number;
  deepDive: Record<string, unknown>;
  pages: DossierPage[];
};

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function sentenceBlocks(value: string, fallback: string): string[] {
  const source = cleanText(value) || fallback;
  return source
    .split(/(?<=[.?!])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function titleFromRecord(record: ArchiveRecord): string {
  const rawTitle = cleanText(record.title);
  if (rawTitle && !["classified event", "strategic event", "unknown"].includes(rawTitle.toLowerCase())) {
    return rawTitle;
  }
  const scenario = cleanText(record.scenario || record.summary);
  if (scenario) {
    const first = scenario.split(/(?<=[.?!])\s+/)[0]?.trim() || scenario;
    return first.length > 92 ? `${first.slice(0, 89).trim()}...` : first;
  }
  return cleanText(record.id || record.event_id) || "Strategic Dossier";
}

function doctrineTakeaway(record: ArchiveRecord): string {
  const deepDive = record.deep_dive || {};
  const threat = cleanText(deepDive.present_threat_comparison);
  const notes = cleanText(record.notes);
  const summary = cleanText(record.summary);
  return threat || notes || summary || "This dossier remains relevant because the pressure method can recur against India in modern form.";
}

function buildPages(record: ArchiveRecord): DossierPage[] {
  const deepDive = (record.deep_dive || {}) as Record<string, unknown>;
  const title = titleFromRecord(record);
  const summary = cleanText(record.summary);
  const scenario = cleanText(record.scenario);
  const intent = cleanText(deepDive.intent);
  const indiaStatus = cleanText(deepDive.india_status_at_moment);
  const indiaReaction = cleanText(deepDive.india_reaction);
  const operations = cleanText(deepDive.operations);
  const presentThreat = cleanText(deepDive.present_threat_comparison);
  const historicalContext = cleanText(deepDive.historical_context);
  const globalIntervention = cleanText(deepDive.global_intervention);
  const lessons = Array.isArray(deepDive.strategic_learnings)
    ? (deepDive.strategic_learnings as unknown[]).map((item) => cleanText(item)).filter(Boolean)
    : [];

  return [
    {
      kicker: "Page 01 / Executive Summary",
      title: `${title}`,
      body: sentenceBlocks(summary, "No executive summary is available yet for this dossier."),
    },
    {
      kicker: "Page 02 / Historical Frame",
      title: "What Happened",
      body: sentenceBlocks(
        scenario || historicalContext || summary,
        "The archive does not yet contain a full narrative reconstruction for this event."
      ),
    },
    {
      kicker: "Page 03 / Root Cause",
      title: "Why It Happened",
      body: sentenceBlocks(intent, "No explicit root-cause assessment is stored yet."),
    },
    {
      kicker: "Page 04 / India At That Moment",
      title: "India's Situation",
      body: sentenceBlocks(
        indiaStatus,
        "The dossier does not yet contain a full India-status assessment for the moment of crisis."
      ),
    },
    {
      kicker: "Page 05 / Operational Flow",
      title: "Operational Sequence",
      body: sentenceBlocks(
        operations || globalIntervention,
        "Operational detail is still incomplete in this file."
      ),
    },
    {
      kicker: "Page 06 / Indian Response",
      title: "How India Responded",
      body: sentenceBlocks(
        indiaReaction,
        "India's response has not yet been fully reconstructed in this dossier."
      ),
    },
    {
      kicker: "Page 07 / Strategic Meaning",
      title: "Why It Mattered For India",
      body: sentenceBlocks(
        doctrineTakeaway(record),
        "The meaning of this event for India still needs to be expanded."
      ),
    },
    {
      kicker: "Page 08 / Lessons",
      title: "Lessons For India",
      body: lessons.length
        ? lessons
        : sentenceBlocks(
            cleanText(record.notes) || "No structured doctrinal lesson is available yet.",
            "No structured doctrinal lesson is available yet."
          ),
    },
    {
      kicker: "Page 09 / Present Match",
      title: "How This Maps To Today",
      body: sentenceBlocks(
        presentThreat || cleanText(record.notes),
        "Use this event as a pattern file to compare present coercion methods against historical precedent."
      ),
    },
    {
      kicker: "Page 10 / Countermeasure Plan",
      title: "What India Must Build Or Protect",
      body: (record.countermeasures || []).length
        ? (record.countermeasures || []).map((item) => cleanText(item)).filter(Boolean)
        : sentenceBlocks(
            cleanText(record.notes) || "No explicit countermeasure plan is stored yet in this file.",
            "No explicit countermeasure plan is stored yet in this file."
          ),
    },
  ];
}

function buildDossier(record: ArchiveRecord): Dossier {
  return {
    id: cleanText(record.id || record.event_id) || "unknown-record",
    title: titleFromRecord(record),
    summary: cleanText(record.summary) || "No summary available yet.",
    scenario: cleanText(record.scenario),
    date: cleanText(record.date) || "Undated",
    actors: record.actors || [],
    targets: record.targets || [],
    regions: record.regions || [],
    eventTypes: record.event_types || [],
    image: record.image,
    notes: cleanText(record.notes),
    keywords: cleanText(record.keywords),
    countermeasures: (record.countermeasures || []).map((item) => cleanText(item)).filter(Boolean),
    sourceReliability: Number(record.source_reliability || 0),
    confidence: Number(record.confidence || 0),
    deepDive: (record.deep_dive || {}) as Record<string, unknown>,
    pages: buildPages(record),
  };
}

export default function StrategicArchive() {
  const [records, setRecords] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [readerOpen, setReaderOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("http://localhost:8005/records");
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Archive failed to load:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReaderOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const dossiers = useMemo(() => records.map(buildDossier), [records]);

  const filtered = useMemo(() => {
    return dossiers.filter((dossier) => {
      const haystack = [
        dossier.id,
        dossier.title,
        dossier.summary,
        dossier.scenario,
        dossier.keywords,
        dossier.actors.join(" "),
        dossier.eventTypes.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [dossiers, search]);

  const selected =
    filtered.find((item) => item.id === selectedId) ||
    dossiers.find((item) => item.id === selectedId) ||
    filtered[0] ||
    dossiers[0] ||
    null;

  useEffect(() => {
    if (!selectedId && dossiers[0]) setSelectedId(dossiers[0].id);
  }, [dossiers, selectedId]);

  const openReader = (id: string) => {
    setSelectedId(id);
    setPageIndex(0);
    setReaderOpen(true);
  };

  const nextPage = () => {
    if (!selected) return;
    setPageIndex((current) => Math.min(current + 1, selected.pages.length - 1));
  };

  const prevPage = () => {
    setPageIndex((current) => Math.max(0, current - 1));
  };

  return (
    <div className="w-full min-h-[80vh]">
      {!opened ? (
        <div className="archive-scene">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="archive-cover-wrap"
          >
            <div className="archive-cover">
              <div className="archive-spine" />
              <div className="archive-corner archive-corner-tl" />
              <div className="archive-corner archive-corner-tr" />
              <div className="archive-corner archive-corner-bl" />
              <div className="archive-corner archive-corner-br" />

              <div className="archive-title-frame">
                <div className="frame-corner frame-corner-tl" />
                <div className="frame-corner frame-corner-tr" />
                <div className="frame-corner frame-corner-bl" />
                <div className="frame-corner frame-corner-br" />
                <div className="archive-logo">VAJRA</div>
                <div className="archive-subtitle">Strategic Command Archive</div>
              </div>

              <div className="archive-stamp">Level Alpha Clearance</div>
              <div className="archive-ref">Ref: strategic-archive-main</div>
            </div>
          </motion.div>

          <div className="archive-cover-footer">
            <div className="archive-hint">Click button to begin</div>
            <button type="button" className="archive-open-btn" onClick={() => setOpened(true)}>
              Open Dossier
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="archive-open-stage"
        >
          <div className="archive-index-shell">
            <div className="archive-index-head">
              <div>
                <p className="archive-index-kicker">Strategic Archive</p>
                <h2 className="archive-index-title">Case Files</h2>
                <p className="archive-index-copy">
                  Browse the archive like a physical records room. Each file opens into a multi-page strategic dossier built from your
                  database.
                </p>
              </div>
              <div className="archive-index-actions">
                <div className="archive-index-pill">{filtered.length} files indexed</div>
                <button
                  type="button"
                  onClick={() => setOpened(false)}
                  className="rounded-full border border-[#3b2e18] px-4 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#d2a24c] hover:bg-[#20160d]"
                >
                  Back To Cover
                </button>
              </div>
            </div>

            <div className="relative archive-index-search">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search files, actors, wars, technologies, sanctions, sabotage..."
                className="w-full rounded-xl border border-[#202020] bg-[#070707] py-3 pl-11 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#8ec6d0]/40 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="flex h-[44vh] flex-col items-center justify-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-500" />
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan-500/60">Loading Case Files</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-[40vh] flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500/50" />
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-gray-500">No files matched this search</p>
              </div>
            ) : (
              <div className="archive-list">
                {filtered.map((dossier) => (
                  <div key={dossier.id} className="archive-list-row">
                    <div className="archive-list-icon">
                      <FileText className="h-7 w-7 text-[#d4a94d]" />
                    </div>

                    <div className="archive-list-main">
                      <div className="archive-list-meta">
                        <span>{dossier.id}</span>
                        <span>{dossier.date}</span>
                        {dossier.eventTypes.slice(0, 2).map((type) => (
                          <span key={`${dossier.id}-${type}`}>{type}</span>
                        ))}
                      </div>

                      <h3 className="archive-list-title">{dossier.title}</h3>
                      <p className="archive-list-summary">{dossier.summary}</p>
                    </div>

                    <div className="archive-list-side">
                      <div className="archive-list-side-box">
                        <p className="archive-list-side-label">Why It Matters To India</p>
                        <p>{dossier.pages[6]?.body[0] || dossier.summary}</p>
                      </div>
                    </div>

                    <div className="archive-list-open">
                      <button type="button" onClick={() => openReader(dossier.id)} className="archive-list-open-btn">
                        Open File
                      </button>
                      <span>{dossier.pages.length} pages</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {readerOpen && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_18%),linear-gradient(180deg,#24170f_0%,#120c08_18%,#050505_100%)] p-4 md:p-6"
          >
            <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden rounded-[30px] border border-[#2f241b] bg-[#0f0d0a] shadow-[0_20px_120px_rgba(0,0,0,0.75)]">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#d2a24c]">Archive File</p>
                  <h3 className="mt-1 font-orbitron text-2xl font-bold uppercase tracking-tight text-white">{selected.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReaderOpen(false)}
                  className="rounded-full border border-white/10 p-2 text-gray-500 hover:border-red-500/30 hover:text-red-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,197,120,0.08),transparent_22%),linear-gradient(180deg,#3a2418_0%,#241810_18%,#130d09_40%,#080808_100%)] p-5 md:p-8">
                <div className="archive-desk h-full rounded-[28px] border border-[#22170f] p-6 md:p-10">
                  <div className="grid h-full grid-cols-1 gap-8 xl:grid-cols-[320px_minmax(0,1fr)_140px]">
                    <div className="archive-folder-panel">
                      <div className="archive-folder-cover">
                        <div className="archive-folder-crest">VAJRA</div>
                        <div className="archive-folder-sub">Strategic Archive Case Files</div>
                        <div className="archive-folder-id">{selected.id}</div>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300/80">
                        Page {pageIndex + 1} / {selected.pages.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={prevPage}
                          disabled={pageIndex === 0}
                          className="rounded-full border border-white/10 p-2 text-gray-500 disabled:opacity-30"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={nextPage}
                          disabled={pageIndex >= selected.pages.length - 1}
                          className="rounded-full border border-white/10 p-2 text-gray-500 disabled:opacity-30"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                      <motion.div
                        key={`${selected.id}-${pageIndex}`}
                        initial={{ rotateY: -18, opacity: 0.6, x: 32 }}
                        animate={{ rotateY: 0, opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative min-h-0 flex-1"
                      >
                        <div className="archive-paper-stack">
                          <div className="archive-paper-sheet archive-paper-sheet-back" />
                          <div className="archive-paper-sheet archive-paper-sheet-mid" />
                          <div className="archive-paper-sheet archive-paper-sheet-front">
                            <div className="archive-paper-meta">
                              <span>{selected.id}</span>
                              <span>{selected.date}</span>
                              <span>{selected.eventTypes.slice(0, 2).join(" / ") || "Strategic Record"}</span>
                              <span>Reliability {selected.sourceReliability || 0}/5</span>
                            </div>

                            <div className="archive-paper-grid">
                              <div className="archive-paper-main">
                                <div className="mb-5 border-b border-[#c6a978]/25 pb-4">
                                  <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#8b5d18]">{selected.pages[pageIndex].kicker}</p>
                                  <h4 className="mt-3 font-orbitron text-[2rem] font-bold uppercase leading-tight tracking-tight text-[#1e180f]">
                                    {selected.pages[pageIndex].title}
                                  </h4>
                                </div>
                                <div className="space-y-4 overflow-y-auto pr-2 font-serif text-[16px] leading-8 text-[#34291b] scrollbar-hide">
                                  {selected.pages[pageIndex].body.map((paragraph, index) => (
                                    <p key={`${selected.pages[pageIndex].title}-${index}`}>{paragraph}</p>
                                  ))}
                                </div>
                              </div>

                              <div className="archive-paper-side">
                                <div className="archive-side-box">
                                  <p className="archive-side-label">Actors & Affiliations</p>
                                  <p>{selected.actors.join(", ") || "Not specified"}</p>
                                </div>
                                <div className="archive-side-box">
                                  <p className="archive-side-label">Strategic Impact</p>
                                  <p>{selected.pages[6]?.body[0] || selected.summary}</p>
                                </div>
                                <div className="archive-side-box">
                                  <p className="archive-side-label">Countermeasure Path</p>
                                  <p>{selected.countermeasures[0] || selected.notes || "No explicit countermeasure stored yet."}</p>
                                </div>
                                {selected.image && (
                                  <div className="archive-side-image">
                                    <img src={selected.image} alt={selected.title} className="h-full w-full object-cover grayscale" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-6 border-t border-[#c6a978]/25 pt-4 text-right text-[10px] font-mono uppercase tracking-[0.25em] text-[#8b5d18]">
                              Page {pageIndex + 1}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="archive-desk-props">
                      <div className="archive-pen" />
                      <div className="archive-photo-stack">
                        <div className="archive-photo archive-photo-top" />
                        <div className="archive-photo archive-photo-mid" />
                        <div className="archive-photo archive-photo-bottom" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .archive-scene {
          min-height: 78vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #050505;
        }

        .archive-cover-wrap {
          perspective: 2500px;
          width: 420px;
          max-width: 88vw;
        }

        .archive-cover {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #1a1c1e;
          border: 1.5px solid #2e3135;
          box-shadow: 6px 0 32px rgba(0, 0, 0, 0.8), inset 0 0 80px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .archive-spine {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 20px;
          background: linear-gradient(to right, #0a0b0c, #1e2124);
          border-right: 1px solid #2a2c2e;
        }

        .archive-corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: #3a3020;
          border-style: solid;
        }

        .archive-corner-tl {
          top: 12px;
          left: 30px;
          border-width: 1px 0 0 1px;
        }

        .archive-corner-tr {
          top: 12px;
          right: 12px;
          border-width: 1px 1px 0 0;
        }

        .archive-corner-bl {
          bottom: 12px;
          left: 30px;
          border-width: 0 0 1px 1px;
        }

        .archive-corner-br {
          bottom: 12px;
          right: 12px;
          border-width: 0 1px 1px 0;
        }

        .archive-title-frame {
          position: relative;
          border: 1.5px solid #c5a059;
          padding: 24px 44px;
          text-align: center;
        }

        .frame-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: #c5a059;
          border-style: solid;
        }

        .frame-corner-tl {
          top: -5px;
          left: -5px;
          border-width: 2px 0 0 2px;
        }

        .frame-corner-tr {
          top: -5px;
          right: -5px;
          border-width: 2px 2px 0 0;
        }

        .frame-corner-bl {
          bottom: -5px;
          left: -5px;
          border-width: 0 0 2px 2px;
        }

        .frame-corner-br {
          bottom: -5px;
          right: -5px;
          border-width: 0 2px 2px 0;
        }

        .archive-logo {
          font-family: "Orbitron", sans-serif;
          color: #c5a059;
          font-size: 3.4rem;
          letter-spacing: 16px;
          text-shadow: 0 0 40px rgba(197, 160, 89, 0.2);
          line-height: 1;
        }

        .archive-subtitle {
          color: #4a4a3a;
          font-size: 0.58rem;
          margin-top: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .archive-stamp {
          margin-top: 80px;
          color: #8b0000;
          border: 2.5px solid #8b0000;
          padding: 6px 20px;
          font-weight: bold;
          font-size: 0.7rem;
          letter-spacing: 2px;
          transform: rotate(-15deg);
          text-transform: uppercase;
        }

        .archive-ref {
          margin-top: 60px;
          color: #2e2e2e;
          font-size: 0.52rem;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .archive-cover-footer {
          margin-top: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .archive-hint {
          color: #888;
          font-size: 0.6rem;
          letter-spacing: 2px;
          opacity: 0.6;
          text-transform: uppercase;
        }

        .archive-open-btn {
          background: transparent;
          border: 1px solid #c5a059;
          color: #c5a059;
          font-family: "Roboto Mono", monospace;
          font-size: 0.65rem;
          letter-spacing: 3px;
          padding: 12px 28px;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s, background 0.2s;
          text-transform: uppercase;
        }

        .archive-open-btn:hover {
          opacity: 1;
          background: rgba(197, 160, 89, 0.1);
        }

        .archive-open-stage {
          min-height: 78vh;
          max-width: 1320px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 3rem;
        }

        .archive-index-shell {
          border-radius: 28px;
          border: 1px solid #171717;
          background: linear-gradient(180deg, rgba(18, 18, 18, 0.98) 0%, rgba(8, 8, 8, 0.98) 100%);
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .archive-index-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.25rem;
          margin-bottom: 1.4rem;
        }

        .archive-index-kicker {
          margin-bottom: 0.75rem;
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #c19442;
        }

        .archive-index-title {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          line-height: 1;
          text-transform: uppercase;
          color: #f8f6f1;
        }

        .archive-index-copy {
          max-width: 760px;
          margin-top: 1rem;
          font-size: 1rem;
          line-height: 1.8;
          color: #6a7082;
        }

        .archive-index-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .archive-index-pill {
          border-radius: 999px;
          border: 1px solid #20444f;
          background: #06181d;
          padding: 0.75rem 1.15rem;
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #89d9e8;
        }

        .archive-index-search {
          margin-bottom: 1.5rem;
        }

        .archive-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .archive-list-row {
          display: grid;
          grid-template-columns: 84px minmax(0, 1.45fr) minmax(240px, 0.9fr) 120px;
          gap: 1.25rem;
          align-items: center;
          border-radius: 24px;
          border: 1px solid #1f1a14;
          background: linear-gradient(180deg, rgba(14, 14, 14, 0.98) 0%, rgba(9, 9, 9, 0.98) 100%);
          padding: 1.4rem;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .archive-list-row:hover {
          transform: translateY(-2px);
          border-color: #463118;
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.18);
        }

        .archive-list-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 18px;
          border: 1px solid rgba(212, 169, 77, 0.18);
          background: rgba(212, 169, 77, 0.06);
        }

        .archive-list-main {
          min-width: 0;
        }

        .archive-list-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-bottom: 0.8rem;
        }

        .archive-list-meta span {
          border-radius: 999px;
          border: 1px solid #2a2a2a;
          padding: 0.18rem 0.55rem;
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b8f98;
        }

        .archive-list-title {
          font-family: "Orbitron", sans-serif;
          font-size: clamp(1.4rem, 2.3vw, 2.7rem);
          line-height: 1.1;
          text-transform: uppercase;
          color: #f5f3ee;
        }

        .archive-list-summary {
          margin-top: 0.9rem;
          font-size: 1rem;
          line-height: 1.7;
          color: #8a8f9d;
        }

        .archive-list-side {
          align-self: stretch;
        }

        .archive-list-side-box {
          height: 100%;
          border-radius: 18px;
          border: 1px solid #211910;
          background: rgba(20, 15, 10, 0.55);
          padding: 1rem 1.05rem;
          font-size: 0.95rem;
          line-height: 1.75;
          color: #d8d0c2;
        }

        .archive-list-side-label {
          margin-bottom: 0.7rem;
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #b88b3d;
        }

        .archive-list-open {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          gap: 0.65rem;
          font-family: "Roboto Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #80848d;
        }

        .archive-list-open-btn {
          border: none;
          background: transparent;
          padding: 0;
          font-family: "Roboto Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7de3ef;
        }

        .archive-desk {
          background:
            linear-gradient(rgba(46, 28, 18, 0.18), rgba(46, 28, 18, 0.18)),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 100%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0 1px, transparent 1px 100%),
            linear-gradient(180deg, #5d3725 0%, #4d2f22 100%);
          background-size: auto, 180px 100%, 100% 120px, auto;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2), inset 0 40px 80px rgba(0, 0, 0, 0.2);
        }

        .archive-folder-panel {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .archive-folder-cover {
          position: relative;
          width: 100%;
          min-height: 560px;
          border-radius: 22px;
          background: linear-gradient(180deg, #2e4056 0%, #223245 100%);
          border: 1px solid #53647c;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28), inset 0 0 50px rgba(255, 255, 255, 0.03);
          padding: 42px 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .archive-folder-cover::before {
          content: "";
          position: absolute;
          inset: 18px;
          border: 1px solid rgba(255, 230, 180, 0.08);
          border-radius: 18px;
        }

        .archive-folder-crest {
          font-family: "Orbitron", sans-serif;
          font-size: 3.1rem;
          letter-spacing: 0.08em;
          color: rgba(11, 18, 28, 0.55);
        }

        .archive-folder-sub {
          margin-top: 18px;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(11, 18, 28, 0.55);
        }

        .archive-folder-id {
          margin-top: auto;
          padding-top: 28px;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: rgba(11, 18, 28, 0.45);
        }

        .archive-paper-stack {
          position: relative;
          height: 100%;
          min-height: 640px;
        }

        .archive-paper-sheet {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          border: 1px solid rgba(191, 163, 122, 0.2);
          background: linear-gradient(180deg, #f5ecd9 0%, #f1e3c6 100%);
          box-shadow: inset 0 0 55px rgba(120, 86, 40, 0.07);
        }

        .archive-paper-sheet-back {
          transform: rotate(-2deg) translate(-24px, 10px);
          background: #ece3d2;
        }

        .archive-paper-sheet-mid {
          transform: rotate(1deg) translate(16px, 6px);
          background: #f4ead6;
        }

        .archive-paper-sheet-front {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          border: 1px solid rgba(191, 163, 122, 0.24);
          background: linear-gradient(180deg, #f8f0df 0%, #f3e7cf 100%);
          box-shadow: 0 18px 35px rgba(0, 0, 0, 0.18), inset 0 0 55px rgba(120, 86, 40, 0.07);
          padding: 24px 28px 30px;
          overflow: hidden;
        }

        .archive-paper-sheet-front::before {
          content: "";
          position: absolute;
          inset-y: 0;
          left: 0;
          width: 12px;
          background: linear-gradient(90deg, rgba(94, 65, 26, 0.08), transparent);
        }

        .archive-paper-meta {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(128, 99, 52, 0.25);
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #8b5d18;
        }

        .archive-paper-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.75fr);
          gap: 22px;
          height: calc(100% - 56px);
        }

        .archive-paper-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .archive-paper-side {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .archive-side-box {
          border: 1px solid rgba(128, 99, 52, 0.18);
          background: rgba(255, 255, 255, 0.32);
          border-radius: 16px;
          padding: 14px 16px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          line-height: 1.7;
          color: #34291b;
        }

        .archive-side-label {
          margin-bottom: 8px;
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #8b5d18;
        }

        .archive-side-image {
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(128, 99, 52, 0.18);
          background: #d7d0c1;
          min-height: 180px;
        }

        .archive-desk-props {
          position: relative;
          display: none;
        }

        .archive-pen {
          position: absolute;
          top: 160px;
          left: 34px;
          width: 12px;
          height: 260px;
          border-radius: 999px;
          background: linear-gradient(180deg, #1f1a15 0%, #573a28 50%, #1f1a15 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 220, 170, 0.18);
          transform: rotate(24deg);
        }

        .archive-photo-stack {
          position: absolute;
          bottom: 40px;
          right: 18px;
          width: 110px;
          height: 150px;
        }

        .archive-photo {
          position: absolute;
          inset: 0;
          border: 8px solid #ece7de;
          background: linear-gradient(180deg, #4a4a4a 0%, #1b1b1b 100%);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.28);
        }

        .archive-photo-top { transform: rotate(8deg) translate(10px, 0); }
        .archive-photo-mid { transform: rotate(-6deg) translate(-6px, 12px); }
        .archive-photo-bottom { transform: rotate(2deg) translate(2px, 26px); }

        @media (min-width: 1280px) {
          .archive-desk-props {
            display: block;
          }
        }

        @media (max-width: 1279px) {
          .archive-list-row {
            grid-template-columns: 84px minmax(0, 1fr);
          }

          .archive-list-side {
            grid-column: 1 / -1;
          }

          .archive-list-open {
            grid-column: 2 / 3;
            align-items: flex-start;
          }

          .archive-paper-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .archive-open-stage {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .archive-index-head {
            flex-direction: column;
          }

          .archive-index-actions {
            width: 100%;
            justify-content: space-between;
          }

          .archive-list-row {
            grid-template-columns: 1fr;
          }

          .archive-list-icon {
            width: 60px;
            height: 60px;
          }

          .archive-list-open {
            grid-column: auto;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
