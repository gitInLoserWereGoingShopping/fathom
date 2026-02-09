"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Explanation, ExplanationLevel } from "@/lib/schema";
import { ExplanationRenderer } from "@/components/ExplanationRenderer";
import { classifyDomain, DOMAIN_DEFINITIONS } from "@/lib/domains";
import { BONUS_INSIGHTS } from "@/lib/bonus-insights";

const levelDescriptions: Record<ExplanationLevel, string> = {
  eli5: "Very accessible, concrete, metaphor-friendly.",
  eli10: "Approachable with more structure and terminology.",
  expert: "Precise, technical, minimal metaphor.",
};

type ExplainResponse = {
  status: "success" | "retrieved" | "failed";
  cacheHit: boolean;
  flowRunId: string;
  explanation?: Explanation;
  explanationId?: string;
  variantId?: string;
  message?: string;
};

export function ExplainForm() {
  const formRef = useRef<HTMLElement | null>(null);
  const answerRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<ExplanationLevel>("eli10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState("space");
  const [artLayer, setArtLayer] = useState<"a" | "b">("a");
  const [signalSelection, setSignalSelection] = useState<
    "helpful" | "tooComplex" | "branched" | null
  >(null);
  const [signalStatus, setSignalStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportStatus, setReportStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "limited"
  >("idle");
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-art-url-a", "var(--theme-art-url-space)");
    root.style.setProperty("--theme-art-url-b", "var(--theme-art-url-space)");
    root.dataset.art = "a";
  }, []);

  const relatedTopics = useMemo(() => {
    return result?.explanation?.relatedTopics ?? [];
  }, [result]);

  const moreToExplore = useMemo(() => {
    const fallbackQuestions = [
      "Why do patterns appear in nature and math?",
      "How does energy move through systems?",
      "Why do small changes sometimes cause big effects?",
      "What makes a good model of a complex system?",
      "How do we measure things we can’t see directly?",
    ];

    if (!result?.explanation) {
      const perDomain = DOMAIN_DEFINITIONS.map((domain) => domain.questions[0]);
      return [...perDomain, ...fallbackQuestions].slice(0, 15);
    }

    const topic = result.explanation.topic ?? result.explanation.title ?? "";
    const normalized = topic.toLowerCase();
    const domainMatch = DOMAIN_DEFINITIONS.find((domain) =>
      domain.topics.some((t) => t.toLowerCase() === normalized),
    );
    const domain =
      domainMatch ??
      DOMAIN_DEFINITIONS.find((entry) => entry.id === classifyDomain(topic));
    const domainQuestions = domain?.questions ?? [];
    const relatedQuestion =
      relatedTopics.length >= 3
        ? [
            `How do ${relatedTopics[0]}, ${relatedTopics[1]}, and ${relatedTopics[2]} relate to each other?`,
            `What connects ${relatedTopics[0]}, ${relatedTopics[1]}, and ${relatedTopics[2]}?`,
            `How do ${relatedTopics[0]} and ${relatedTopics[1]} shape ${relatedTopics[2]}?`,
          ]
        : relatedTopics.length === 2
          ? [
              `How do ${relatedTopics[0]} and ${relatedTopics[1]} relate to each other?`,
              `What do ${relatedTopics[0]} and ${relatedTopics[1]} have in common?`,
              `How does ${relatedTopics[0]} influence ${relatedTopics[1]}?`,
            ]
          : relatedTopics.length === 1
            ? [
                `How does ${relatedTopics[0]} connect to this topic?`,
                `Why is ${relatedTopics[0]} important here?`,
                `How can ${relatedTopics[0]} help explain this?`,
              ]
            : undefined;
    const pickRelated =
      relatedQuestion && relatedQuestion.length > 0
        ? relatedQuestion[Math.floor(Math.random() * relatedQuestion.length)]
        : undefined;
    const combined = [
      ...domainQuestions,
      ...(pickRelated ? [pickRelated] : []),
    ];
    return Array.from(new Set(combined)).slice(0, 10);
  }, [result, relatedTopics]);

  const bonusInsights = useMemo(() => {
    const topic = (
      result?.explanation?.topic ??
      result?.explanation?.title ??
      ""
    ).toLowerCase();
    return BONUS_INSIGHTS[topic] ?? [];
  }, [result]);

  const loadingPlan = useMemo(() => {
    const plans: Record<string, { label: string; steps: string[] }> = {
      space: {
        label: "Cosmic inquiry",
        steps: [
          "Consulting star charts",
          "Asking the universe for a hint",
          "Mapping the big picture",
          "Translating to human terms",
        ],
      },
      nature: {
        label: "Bio sketch",
        steps: [
          "Zooming into the system",
          "Finding the key players",
          "Building the sequence",
          "Summarizing the takeaway",
        ],
      },
      physics: {
        label: "Physics bench",
        steps: [
          "Warming up the models",
          "Tracking the forces",
          "Simplifying the core rules",
          "Building a clear story",
        ],
      },
      chemistry: {
        label: "Chem lab",
        steps: [
          "Identifying key particles",
          "Mapping the reaction path",
          "Balancing the changes",
          "Summarizing the result",
        ],
      },
      earth: {
        label: "Earth systems",
        steps: [
          "Reading the terrain",
          "Tracing cycles and flows",
          "Connecting causes and effects",
          "Turning it into a clear story",
        ],
      },
      ocean: {
        label: "Ocean currents",
        steps: [
          "Measuring the tides",
          "Tracking the flow paths",
          "Connecting heat and motion",
          "Packaging the insights",
        ],
      },
      mind: {
        label: "Mind lab",
        steps: [
          "Scanning mental models",
          "Finding the main pathway",
          "Checking for clean analogies",
          "Packaging it for clarity",
        ],
      },
      engineering: {
        label: "Design studio",
        steps: [
          "Defining the constraints",
          "Mapping the mechanisms",
          "Testing the tradeoffs",
          "Finalizing the explanation",
        ],
      },
      computing: {
        label: "Compute core",
        steps: [
          "Parsing the inputs",
          "Tracing the algorithm",
          "Simplifying the logic",
          "Delivering the output",
        ],
      },
      math: {
        label: "Pattern lab",
        steps: [
          "Spotting the structure",
          "Choosing the right tools",
          "Checking the relationships",
          "Explaining the pattern",
        ],
      },
    };

    return (
      plans[activeTheme] ?? {
        label: "Learning flow",
        steps: [
          "Clarifying the question",
          "Gathering the intuition",
          "Structuring the answer",
          "Polishing for your level",
        ],
      }
    );
  }, [activeTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = activeTheme;
    return () => {
      delete root.dataset.theme;
    };
  }, [activeTheme]);

  useEffect(() => {
    const root = document.documentElement;
    setArtLayer((prev) => {
      const nextLayer = prev === "a" ? "b" : "a";
      const nextVar =
        nextLayer === "a" ? "--theme-art-url-a" : "--theme-art-url-b";
      root.style.setProperty(nextVar, `var(--theme-art-url-${activeTheme})`);
      root.dataset.art = nextLayer;
      return nextLayer;
    });
  }, [activeTheme]);

  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const interval = window.setInterval(() => {
      setLoadingStep((current) =>
        Math.min(current + 1, loadingPlan.steps.length),
      );
    }, 900);
    return () => window.clearInterval(interval);
  }, [loading, loadingPlan.steps.length]);

  useEffect(() => {
    if (loading || !result?.explanation) return;
    const timer = window.setTimeout(() => scrollToAnswer(), 300);
    return () => window.clearTimeout(timer);
  }, [loading, result?.explanation]);

  async function handleSubmit(
    mode: "default" | "new_variant" = "default",
    nextQuery?: string,
  ) {
    const startedAt = Date.now();
    setLoading(true);
    setError(null);
    setSignalSelection(null);
    setSignalStatus("idle");
    setReportStatus("idle");
    setReportMessage(null);
    setReportOpen(false);
    setReportReason("");
    setActiveTheme(classifyDomain(nextQuery ?? query));
    const queryValue = nextQuery ?? query;
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: queryValue, level, mode }),
    });

    const data = (await response.json()) as ExplainResponse;
    if (!response.ok || data.status === "failed") {
      setError(data.message ?? "Something went wrong.");
      setResult(null);
    } else {
      setResult(data);
    }

    const minDelayMs = 4000;
    const elapsed = Date.now() - startedAt;
    if (elapsed < minDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, minDelayMs - elapsed));
    }

    setLoading(false);
  }

  async function sendSignal(signalType: "helpful" | "tooComplex") {
    if (!result?.explanationId) return;
    setSignalStatus("sending");
    try {
      const response = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explanationId: result.explanationId,
          variantId: result.variantId,
          signalType,
        }),
      });
      if (!response.ok) {
        setSignalStatus("error");
        return;
      }
      setSignalStatus("sent");
    } catch (error) {
      setSignalStatus("error");
    }
  }

  function handleSignalClick(signalType: "helpful" | "tooComplex") {
    if (signalSelection === signalType) return;
    setSignalSelection(signalType);
    void sendSignal(signalType);
  }

  async function submitReport() {
    if (!result?.explanationId) return;
    if (reportReason.trim().length < 8) {
      setReportStatus("error");
      return;
    }
    setReportStatus("sending");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explanationId: result.explanationId,
          variantId: result.variantId,
          reason: reportReason.trim(),
        }),
      });
      if (response.status === 429) {
        setReportStatus("limited");
        return;
      }
      if (!response.ok) {
        setReportStatus("error");
        return;
      }
      setReportStatus("sent");
      setReportMessage(
        "Thanks for flagging this. The response was hidden and sent for review.",
      );
      setResult(null);
      setReportReason("");
      setReportOpen(false);
    } catch (error) {
      setReportStatus("error");
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToAnswer() {
    answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDomainTopicClick(
    domainId: string,
    topic: string,
    nextLevel?: ExplanationLevel,
  ) {
    setQuery(topic);
    setActiveTheme(domainId);
    if (nextLevel) {
      setLevel(nextLevel);
    }
    scrollToForm();
    handleSubmit("default", topic);
  }



  return (
    <div className="stack">
      <section className="card" ref={formRef}>
        <label className="label" htmlFor="query">
          I&apos;m interested in learning more about…
        </label>
        <textarea
          id="query"
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. How does electricity flow?"
          rows={3}
        />
        <div className="levels">
          {(["eli5", "eli10", "expert"] as ExplanationLevel[]).map((value) => (
            <button
              key={value}
              type="button"
              className={`pill ${level === value ? "active" : ""}`}
              onClick={() => setLevel(value)}
            >
              <span className="pill-title">
                {value === "eli5"
                  ? "Explain Like I’m 5"
                  : value === "eli10"
                    ? "Explain Like I’m 10"
                    : "Explain Like I'm an Expert"}
              </span>
              <span className="pill-subtitle">{levelDescriptions[value]}</span>
            </button>
          ))}
        </div>
        <div className="actions">
          <button
            className={`btn ${loading ? "loading" : ""}`}
            onClick={() => handleSubmit("default")}
            disabled={loading || query.trim().length < 2}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" aria-hidden="true" />
                Thinking
              </span>
            ) : (
              "Explain"
            )}
          </button>
          {result?.explanation ? (
            <button
              className="btn secondary"
              onClick={() => handleSubmit("new_variant")}
              disabled={loading}
            >
              Generate another explanation
            </button>
          ) : null}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {reportMessage ? <p className="muted">{reportMessage}</p> : null}
      </section>

      {loading ? (
        <section className="card loading-card">
          <div className="loading-header">
            <div>
              <div className="loading-topline">
                <span className="spinner cosmic" aria-hidden="true" />
                <p className="eyebrow">Thinking</p>
              </div>
              <h2>{loadingPlan.label}</h2>
              <p className="muted">
                Crafting an explanation tailored to {level.toUpperCase()} depth.
              </p>
            </div>
          </div>
          <div className="progress-list">
            {loadingPlan.steps.map((step, index) => {
              const status =
                loadingStep > index
                  ? "complete"
                  : loadingStep === index
                    ? "active"
                    : "pending";
              return (
                <div key={step} className={`progress-item ${status}`}>
                  <span className="progress-icon" aria-hidden="true" />
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {result?.explanation && !loading ? (
        <section className="stack" ref={answerRef}>
          <div className="card answer-card">
            <h2>{result.explanation.title}</h2>
            <p className="muted">{result.explanation.summary}</p>
            <ExplanationRenderer
              blocks={result.explanation.blocks}
              vignetteKind={
                /(volcano|volcanoes)/i.test(
                  result.explanation.topic ?? result.explanation.title,
                )
                  ? "volcano"
                  : /(waves and energy)/i.test(
                        result.explanation.topic ?? result.explanation.title,
                      )
                    ? "oceanWaves"
                    : undefined
              }
              bonusInsights={bonusInsights}
            />
          </div>

          <div className="card">
            <h3>Was this helpful?</h3>
            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => handleSignalClick("helpful")}
                disabled={
                  !result.explanationId ||
                  signalSelection === "helpful" ||
                  signalStatus === "sending"
                }
              >
                {signalSelection === "helpful" ? "Helpful ✓" : "Helpful"}
              </button>
              <button
                className="btn secondary"
                onClick={() => handleSignalClick("tooComplex")}
                disabled={
                  !result.explanationId ||
                  signalSelection === "tooComplex" ||
                  signalStatus === "sending"
                }
              >
                {signalSelection === "tooComplex"
                  ? "Too complex ✓"
                  : "Too complex"}
              </button>
              <button
                className="btn secondary"
                onClick={() => setReportOpen(true)}
                disabled={!result.explanationId || signalStatus === "sending"}
              >
                Report unsafe
              </button>
            </div>
            {signalStatus === "error" ? (
              <p className="error-text">Signal failed. Try again.</p>
            ) : null}
            {reportOpen ? (
              <div className="report-box">
                <label className="label" htmlFor="report-reason">
                  What felt unsafe?
                </label>
                <textarea
                  id="report-reason"
                  className="input"
                  rows={3}
                  placeholder="Describe the issue so we can review it."
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                />
                <div className="actions">
                  <button
                    className="btn"
                    type="button"
                    onClick={submitReport}
                    disabled={
                      reportStatus === "sending" ||
                      reportReason.trim().length < 8
                    }
                  >
                    {reportStatus === "sending"
                      ? "Sending..."
                      : "Submit report"}
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setReportOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
                {reportStatus === "limited" ? (
                  <p className="error-text">
                    You&apos;ve hit the daily limit. Try again tomorrow.
                  </p>
                ) : null}
                {reportStatus === "error" ? (
                  <p className="error-text">Report failed. Try again.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {result?.explanation && relatedTopics.length > 0 ? (
        <section className="card">
          <h3>Explore related ideas</h3>
          <div className="tag-list-explore-related">
            {relatedTopics.map((topic) => (
              <button
                key={topic}
                className="tag"
                onClick={() => {
                  setQuery(topic);
                  scrollToForm();
                  handleSubmit("default", topic);
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {result?.explanation && moreToExplore.length > 0 ? (
        <section className="card">
          <h3>More to explore</h3>
          <div className="tag-list-seed-topics">
            {moreToExplore.map((topic) => (
              <button
                key={topic}
                className="tag"
                onClick={() => {
                  setQuery(topic);
                  scrollToForm();
                  handleSubmit("default", topic);
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card">
        <div className="section-header-row">
          <h3 className="domain-title">
            <span>Explore by domain</span>
            <div className="domain-levels inline">
              {(["eli5", "eli10", "expert"] as ExplanationLevel[]).map(
                (value) => (
                  <button
                    key={`domain-${value}`}
                    type="button"
                    className={`pill mini ${level === value ? "active" : ""}`}
                    onClick={() => setLevel(value)}
                  >
                    {value === "eli5"
                      ? "ELI-5"
                      : value === "eli10"
                        ? "ELI-10"
                        : "ELI-Expert"}
                  </button>
                ),
              )}
            </div>
          </h3>
        </div>
        <div className="domain-grid">
          {DOMAIN_DEFINITIONS.map((domain) => (
            <div key={domain.id} className="domain-card">
              <div className="domain-header">
                <h4>{domain.label}</h4>
                <p className="muted">{domain.description}</p>
              </div>
              <div className="tag-list">
                {domain.topics.map((topic) => (
                  <button
                    key={topic}
                    className="tag"
                    onClick={() => {
                      handleDomainTopicClick(domain.id, topic);
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <div className="domain-questions">
                <p className="muted">Try a question</p>
                <div className="tag-list">
                  {domain.questions.map((question) => (
                    <button
                      key={question}
                      className="tag"
                      onClick={() =>
                        handleDomainTopicClick(domain.id, question)
                      }
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {!result?.explanation && moreToExplore.length > 0 ? (
        <section className="card">
          <h3>More to explore</h3>
          <div className="tag-list-seed-topics">
            {moreToExplore.map((topic) => (
              <button
                key={topic}
                className="tag"
                onClick={() => {
                  setQuery(topic);
                  scrollToForm();
                  handleSubmit("default", topic);
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
