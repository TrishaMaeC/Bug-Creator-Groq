import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_URL = "http://localhost:3001/api/generate-bug";
const EXAMPLES = [
  "Login form validation",
  "Checkout payment",
  "Password reset email",
  "Product search filters",
];

// Reads the severity level out of the generated report so the card can be color-coded.
function detectSeverity(text) {
  const m = text.match(/severity[^a-z0-9]{0,12}(critical|high|medium|low)/i);
  return m ? m[1].toLowerCase() : "unknown";
}

// Wraps tables so they scroll sideways on small screens.
const markdownComponents = {
  table: ({ children }) => (
    <div className="table-wrap">
      <table>{children}</table>
    </div>
  ),
};

export default function App() {
  const [feature, setFeature] = useState("");
  const [subject, setSubject] = useState("");
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  const loading = status === "loading";
  const severity = status === "done" ? detectSeverity(report) : "none";

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  async function generate(name = feature) {
    const value = name.trim();
    if (!value || loading) return;
    setFeature(value);
    setSubject(value);
    setStatus("loading");
    setReport("");
    setError("");
    setCopied(false);
    try {
      const res = await axios.post(API_URL, { feature: value });
      setReport(res.data.bugReport);
      setStatus("done");
    } catch (err) {
      setError(
        err.response
          ? "The server returned an error. Check the server terminal for details."
          : "Can’t reach the server. Start it with npm run dev in the server folder."
      );
      setStatus("error");
    }
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function clearReport() {
    setReport("");
    setError("");
    setStatus("idle");
  }

  return (
    <div className="shell">
      <header className="bar">
        <span className="brand">
          Trixie QA <small>by Trisha</small>
        </span>
        <button type="button" className="toggle" onClick={() => setDark((d) => !d)}>
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <section className="hero">
        <h1>What are we testing?</h1>
        <p className="lede">Name a feature and get a bug report draft you can edit and file.</p>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
        >
          <label htmlFor="feature" className="sr-only">
            Feature to test
          </label>
          <input
            id="feature"
            type="text"
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            placeholder="e.g. Login form validation"
            autoComplete="off"
          />
          <button className="go" disabled={loading || !feature.trim()}>
            {loading ? "Generating…" : "Generate"}
          </button>
        </form>

        <ul className="chips">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button type="button" className="chip" disabled={loading} onClick={() => generate(ex)}>
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="ticket" data-state={status} data-severity={severity} aria-live="polite" aria-busy={loading}>
        {status === "idle" && (
          <div className="empty">
            <h2>No report yet</h2>
            <p>Pick an example or type a feature above. Your report appears here.</p>
          </div>
        )}

        {loading && (
          <div className="skeleton" role="status">
            <span className="sr-only">Generating report</span>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        )}

        {status === "error" && (
          <div className="empty">
            <h2>Report not generated</h2>
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => generate()}>
              Try again
            </button>
          </div>
        )}

        {status === "done" && (
          <>
            <header className="ticket-head">
              <div>
                <h2>{subject}</h2>
                {severity !== "unknown" && <span className="sev">{severity} severity</span>}
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={copyReport}>
                  {copied ? "Copied" : "Copy report"}
                </button>
                <button type="button" className="secondary" onClick={clearReport}>
                  Clear
                </button>
              </div>
            </header>
            <div className="report">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {report}
              </ReactMarkdown>
            </div>
          </>
        )}
      </section>

      <p className="note">
        Reports are AI drafts. Names, versions and URLs in them are invented, so check every detail before filing.
      </p>
    </div>
  );
}