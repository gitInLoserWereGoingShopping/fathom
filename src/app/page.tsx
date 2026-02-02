import { ExplainForm } from "@/components/ExplainForm";
import { seedTopics } from "@/lib/seed-topics";

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
          <h3>How it works</h3>
          <ul>
            <li>Ask a question in your own words.</li>
            <li>Choose the depth that fits your moment.</li>
            <li>Explore related ideas and revisit concepts.</li>
          </ul>
        </div>
      </header>

      <ExplainForm seedTopics={seedTopics} />
    </div>
  );
}
