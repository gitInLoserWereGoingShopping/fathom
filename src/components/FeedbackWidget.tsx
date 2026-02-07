"use client";

import { useState } from "react";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submitFeedback() {
    if (message.trim().length < 3) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("sent");
      setMessage("");
      setTimeout(() => setOpen(false), 800);
    } catch (error) {
      setStatus("error");
    }
  }

  return (
    <div className="feedback-widget">
      <button
        className="icon-button"
        type="button"
        aria-label="Send feedback"
        onClick={() => {
          setOpen((value) => !value);
          setStatus("idle");
        }}
      >
        i
      </button>
      {open ? (
        <div className="feedback-popover">
          <p className="muted">Have a suggestion for the experience?</p>
          <textarea
            className="input"
            rows={3}
            placeholder="Share feedback or ideas..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="actions">
            <button
              className="btn"
              type="button"
              onClick={submitFeedback}
              disabled={status === "sending" || message.trim().length < 3}
            >
              {status === "sending" ? "Sending..." : "Send feedback"}
            </button>
          </div>
          {status === "sent" ? (
            <p className="muted">Thanks — received.</p>
          ) : null}
          {status === "error" ? (
            <p className="error-text">Couldn’t send. Try again.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
