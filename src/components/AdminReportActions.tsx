"use client";

import { useState } from "react";

export function AdminReportActions({
  reportId,
  secret,
}: {
  reportId: string;
  secret: string;
}) {
  const [status, setStatus] = useState("");

  async function handleAction(path: string) {
    setStatus("Working...");
    const response = await fetch(`${path}?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
    });
    if (!response.ok) {
      setStatus("Action failed.");
      return;
    }
    setStatus("Updated.");
  }

  return (
    <div className="actions">
      <button
        className="btn secondary"
        type="button"
        onClick={() => handleAction(`/api/admin/reports/${reportId}/resolve`)}
      >
        Mark reviewed
      </button>
      <button
        className="btn"
        type="button"
        onClick={() => handleAction(`/api/admin/reports/${reportId}/restore`)}
      >
        Restore answer
      </button>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
