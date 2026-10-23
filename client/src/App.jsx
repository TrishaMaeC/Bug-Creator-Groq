import { useState } from "react";
import axios from "axios";

function App() {
  const [feature, setFeature] = useState("");
  const [bugReport, setBugReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!feature.trim()) return alert("Please enter a feature name.");
    setLoading(true);
    setBugReport("");
    try {
      const res = await axios.post("http://localhost:3001/api/generate-bug", { feature });
      setBugReport(res.data.bugReport);
    } catch {
      setBugReport("❌ Error connecting to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>🐞 Bug Creator (Groq)</h1>
      <input
        type="text"
        placeholder="Enter feature (e.g. Login form)"
        value={feature}
        onChange={(e) => setFeature(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "1rem" }}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Bug"}
      </button>
      {bugReport && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "1rem",
            marginTop: "1rem",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {bugReport}
        </pre>
      )}
    </div>
  );
}

export default App;