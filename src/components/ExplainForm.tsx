"use client";

import { useEffect, useMemo, useState } from "react";
import type { Explanation, ExplanationLevel } from "@/lib/schema";
import { ExplanationRenderer } from "@/components/ExplanationRenderer";
import { classifyDomain, DOMAIN_DEFINITIONS } from "@/lib/domains";

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

export function ExplainForm({ seedTopics }: { seedTopics: string[] }) {
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

  const loadingPlan = useMemo(() => {
    const lower = query.toLowerCase();
    if (/(space|cosmic|galaxy|universe|star|planet|black hole)/i.test(lower)) {
      return {
        label: "Cosmic inquiry",
        steps: [
          "Consulting star charts",
          "Asking the universe for a hint",
          "Mapping the big picture",
          "Translating to human terms",
        ],
      };
    }
    if (/(brain|mind|memory|neuron|behavior|psych)/i.test(lower)) {
      return {
        label: "Mind lab",
        steps: [
          "Scanning mental models",
          "Finding the main pathway",
          "Checking for clean analogies",
          "Packaging it for clarity",
        ],
      };
    }
    if (/(energy|electric|current|circuit|charge|magnet)/i.test(lower)) {
      return {
        label: "Physics bench",
        steps: [
          "Warming up the circuits",
          "Tracking the flow",
          "Simplifying the core forces",
          "Building a clear story",
        ],
      };
    }
    if (/(cell|dna|protein|gene|evolution|biology|body)/i.test(lower)) {
      return {
        label: "Bio sketch",
        steps: [
          "Zooming into the system",
          "Finding the key players",
          "Building the sequence",
          "Summarizing the takeaway",
        ],
      };
    }
    return {
      label: "Learning flow",
      steps: [
        "Clarifying the question",
        "Gathering the intuition",
        "Structuring the answer",
        "Polishing for your level",
      ],
    };
  }, [query]);

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

  async function handleSubmit(
    mode: "default" | "new_variant" = "default",
    nextQuery?: string,
  ) {
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

  function scrollToTop() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="stack">
      <section className="card">
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
              <span className="pill-title">{value.toUpperCase()}</span>
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
                Crafting an explanation tailored to{" "}
                {level.toUpperCase()} depth.
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
        <section className="stack">
          <div className="card">
            <h2>{result.explanation.title}</h2>
            <p className="muted">{result.explanation.summary}</p>
            <ExplanationRenderer blocks={result.explanation.blocks} />
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
                    {reportStatus === "sending" ? "Sending..." : "Submit report"}
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

      {relatedTopics.length > 0 ? (
        <section className="card">
          <h3>Explore related ideas</h3>
          <div className="tag-list">
            {relatedTopics.map((topic) => (
              <button
                key={topic}
                className="tag"
                onClick={() => {
                  setQuery(topic);
                  scrollToTop();
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
        <h3>Seed topics</h3>
        <div className="tag-list">
          {seedTopics.map((topic) => (
            <button
              key={topic}
              className="tag"
              onClick={() => {
                setQuery(topic);
                scrollToTop();
                handleSubmit("default", topic);
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Explore by domain</h3>
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
                      setQuery(topic);
                      scrollToTop();
                      handleSubmit("default", topic);
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
