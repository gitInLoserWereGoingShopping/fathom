import type { ExplanationBlock } from "@/lib/schema";
import { prisma } from "@/lib/db";
import { isAdminSecretValid } from "@/lib/admin";
import { ExplanationRenderer } from "@/components/ExplanationRenderer";
import { AdminFlowActions } from "@/components/AdminFlowActions";

type FlowTrace = {
  input?: Record<string, unknown>;
  canonicalise?: Record<string, unknown>;
  retrieval?: Record<string, unknown>;
  promptBuild?: Record<string, unknown>;
  modelCall?: Record<string, unknown>;
  parse?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  renderPreview?: { blockTypes?: Array<{ type: string; supported: boolean }> };
  persist?: { explanationId?: string };
  error?: string;
};

export default async function FlowDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { secret?: string };
}) {
  const secret = searchParams.secret ?? "";

  if (!isAdminSecretValid(secret)) {
    return (
      <div className="page">
        <h1>Admin access required</h1>
        <p>Provide a valid secret to view flow details.</p>
      </div>
    );
  }

  const flow = await prisma.flowRun.findUnique({
    where: { id: params.id },
  });

  if (!flow) {
    return (
      <div className="page">
        <h1>Flow run not found</h1>
      </div>
    );
  }

  const trace = flow.trace as FlowTrace;
  const previewBlocks = trace?.renderPreview?.blockTypes ?? [];
  const explanation = trace?.persist?.explanationId
    ? await prisma.explanation.findUnique({
        where: { id: trace.persist.explanationId },
      })
    : null;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Flow Run Detail</h1>
          <p className="muted">{flow.id}</p>
        </div>
      </header>

      <AdminFlowActions flowId={flow.id} secret={secret} />

      <div className="stack">
        <section className="card">
          <h2>INPUT</h2>
          <pre>{JSON.stringify(trace?.input ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>CANONICALISE</h2>
          <pre>{JSON.stringify(trace?.canonicalise ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>RETRIEVAL</h2>
          <pre>{JSON.stringify(trace?.retrieval ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>PROMPT BUILD</h2>
          <pre>{JSON.stringify(trace?.promptBuild ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>MODEL CALL</h2>
          <pre>{JSON.stringify(trace?.modelCall ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>PARSE</h2>
          <pre>{JSON.stringify(trace?.parse ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>VALIDATION</h2>
          <pre>{JSON.stringify(trace?.validation ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>RENDER PREVIEW</h2>
          <pre>{JSON.stringify(previewBlocks ?? {}, null, 2)}</pre>
        </section>
        <section className="card">
          <h2>PERSIST</h2>
          <pre>{JSON.stringify(trace?.persist ?? {}, null, 2)}</pre>
        </section>
        {trace?.error ? (
          <section className="card warning">
            <h2>ERROR</h2>
            <pre>{trace.error}</pre>
          </section>
        ) : null}
      </div>

      {explanation ? (
        <section className="card">
          <h2>Render Preview</h2>
          <ExplanationRenderer
            blocks={
              (explanation.content as { blocks?: ExplanationBlock[] }).blocks ??
              []
            }
            showUnknown
          />
        </section>
      ) : null}
    </div>
  );
}
