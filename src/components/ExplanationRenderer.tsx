"use client";

import type { ExplanationBlock } from "@/lib/schema";
import { TopicVignette } from "@/components/TopicVignette";

const toneStyles: Record<string, string> = {
  tip: "callout tip",
  note: "callout note",
  warning: "callout warning",
};

export function ExplanationRenderer({
  blocks,
  showUnknown = false,
  vignetteKind,
  bonusInsights = [],
}: {
  blocks: ExplanationBlock[];
  showUnknown?: boolean;
  vignetteKind?: "volcano" | "oceanWaves";
  bonusInsights?: string[];
}) {
  function cleanStepText(input: string) {
    return input.replace(/^\s*(step\s*)?\d+[\).\-\:]\s*/i, "");
  }

  return (
    <div className="blocks">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            if (index === 0 && vignetteKind) {
              return (
                <div key={index} className="heading-with-vignette">
                  <h3>{block.text}</h3>
                  <TopicVignette kind={vignetteKind} />
                </div>
              );
            }
            return <h3 key={index}>{block.text}</h3>;
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "analogy":
            return (
              <section key={index} className="card">
                <strong>{block.title ?? "Analogy"}</strong>
                <p>{block.text}</p>
              </section>
            );
          case "steps":
            return (
              <section key={index} className="card">
                <strong>{block.title ?? "Steps"}</strong>
                <ol>
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{cleanStepText(item)}</li>
                  ))}
                </ol>
              </section>
            );
          case "intuition":
            return (
              <section key={index} className="card">
                <strong>{block.title ?? "Physical intuition"}</strong>
                <p>{block.text}</p>
              </section>
            );
          case "technical":
            return (
              <section key={index} className="card">
                <strong>{block.title ?? "Technical view"}</strong>
                <p>{block.text}</p>
              </section>
            );
          case "equation":
            return (
              <section key={index} className="card">
                <code>{block.latex}</code>
                {block.explanation ? <p>{block.explanation}</p> : null}
              </section>
            );
          case "callout":
            return (
              <section key={index} className={toneStyles[block.tone]}>
                <p>{block.text}</p>
              </section>
            );
          case "check":
            return (
              <section key={index} className="card">
                <strong>Check your understanding</strong>
                <ul>
                  {block.questions.map((question, questionIndex) => (
                    <li key={questionIndex}>{question}</li>
                  ))}
                </ul>
              </section>
            );
          default:
            if (!showUnknown) return null;
            const unknownBlock = block as unknown as Record<string, unknown>;
            return (
              <section key={index} className="card warning">
                <strong>Unknown block</strong>
                <pre>{JSON.stringify(unknownBlock, null, 2)}</pre>
              </section>
            );
        }
      })}
      {bonusInsights.length > 0 ? (
        <section className="bonus-card">
          <h3>Bonus insights</h3>
          <ul>
            {bonusInsights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
