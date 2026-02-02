"use client";

import { useMemo, useState } from "react";
import type { Explanation, ExplanationLevel } from "@/lib/schema";
import { ExplanationRenderer } from "@/components/ExplanationRenderer";

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

  const relatedTopics = useMemo(() => {
    return result?.explanation?.relatedTopics ?? [];
  }, [result]);

  async function handleSubmit(
    mode: "default" | "new_variant" = "default",
    nextQuery?: string,
  ) {
    setLoading(true);
    setError(null);
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

  async function sendSignal(signalType: "helpful" | "tooComplex" | "branched") {
    if (!result?.explanationId) return;
    await fetch("/api/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        explanationId: result.explanationId,
        variantId: result.variantId,
        signalType,
      }),
    });
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
            className="btn"
            onClick={() => handleSubmit("default")}
            disabled={loading || query.trim().length < 2}
          >
            {loading ? "Thinking…" : "Explain"}
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
        {result ? (
          <p className="muted">
            {result.status === "retrieved"
              ? "Retrieved from cache"
              : "Generated fresh"}
            {result.cacheHit ? " · cache hit" : ""}
          </p>
        ) : null}
      </section>

      {result?.explanation ? (
        <section className="stack">
          <div className="card">
            <h2>{result.explanation.title}</h2>
            <p className="muted">{result.explanation.summary}</p>
            <ExplanationRenderer blocks={result.explanation.blocks} />
          </div>

          <div className="card">
            <h3>Signals</h3>
            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => sendSignal("helpful")}
              >
                Helpful
              </button>
              <button
                className="btn secondary"
                onClick={() => sendSignal("tooComplex")}
              >
                Too complex
              </button>
              <button
                className="btn secondary"
                onClick={() => sendSignal("branched")}
              >
                Branched out
              </button>
            </div>
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
                handleSubmit("default", topic);
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
