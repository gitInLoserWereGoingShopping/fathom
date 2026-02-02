"use client";

import { useState } from "react";

export function AdminFlowActions({
  flowId,
  secret,
}: {
  flowId: string;
  secret: string;
}) {
  const [status, setStatus] = useState<string>("");

  async function handleAction(path: string) {
    setStatus("Running...");
    const response = await fetch(
      `${path}?secret=${encodeURIComponent(secret)}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      setStatus("Action failed.");
      return;
    }

    const data = await response.json();
    if (data?.flowRunId) {
      setStatus(`Completed. New flow: ${data.flowRunId}`);
    } else if (data?.ok) {
      setStatus("Updated.");
    } else {
      setStatus("Completed.");
    }
  }

  return (
    <div className="actions">
      <button
        className="btn secondary"
        onClick={() => handleAction(`/api/admin/flows/${flowId}/rerun`)}
      >
        Run again
      </button>
      <button
        className="btn secondary"
        onClick={() => handleAction(`/api/admin/flows/${flowId}/new-variant`)}
      >
        Generate new variant
      </button>
      <button
        className="btn"
        onClick={() => handleAction(`/api/admin/flows/${flowId}/promote`)}
      >
        Promote to public
      </button>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
