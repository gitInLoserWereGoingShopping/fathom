import { ExplainForm } from "@/components/ExplainForm";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export default function Home() {
  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Fathom</p>
          <h1>Convert curiosity into understanding.</h1>
          <p className="subhead">
            A calm, progressive learning system for science-first exploration.
          </p>
        </div>
        <div className="hero-card">
          <div className="hero-card-header">
            <h3>How it works</h3>
            <FeedbackWidget />
          </div>
          <div className="how-it-works">
            <p className="subhead">Ask a question in your own words.</p>
            <p className="subhead">Choose the depth that fits your moment.</p>
            <p className="subhead">
              Explore related ideas and revisit concepts.
            </p>
          </div>
        </div>
      </header>

      <ExplainForm />
    </div>
  );
}
