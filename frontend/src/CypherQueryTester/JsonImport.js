import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JsonImport.css";

export default function JsonImportPage() {
  const navigate = useNavigate();

  const [rawJson, setRawJson] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const validateJson = (obj) => {
    if (!obj || typeof obj !== "object") {
      throw new Error("JSON must be an object");
    }

    if (!Array.isArray(obj.nodes) || !Array.isArray(obj.relationships)) {
      throw new Error("JSON must contain nodes[] and relationships[]");
    }

    const idSet = new Set();

    obj.nodes.forEach((n, idx) => {
      if (!n.tempId || !n.label) {
        throw new Error(`Node at index ${idx} missing tempId or label`);
      }
      if (idSet.has(n.tempId)) {
        throw new Error(`Duplicate tempId: ${n.tempId}`);
      }
      idSet.add(n.tempId);
      if (n.properties && typeof n.properties !== "object") {
        throw new Error(`Node properties must be an object (tempId: ${n.tempId})`);
      }
    });

    obj.relationships.forEach((r, idx) => {
      if (!r.from || !r.to || !r.type) {
        throw new Error(`Relationship at index ${idx} missing from/to/type`);
      }
      if (!idSet.has(r.from) || !idSet.has(r.to)) {
        throw new Error(
          `Relationship references unknown tempId (${r.from} → ${r.to})`
        );
      }
      if (r.properties && typeof r.properties !== "object") {
        throw new Error(`Relationship properties must be an object`);
      }
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        validateJson(obj);
        setRawJson(JSON.stringify(obj, null, 2));
        setParsed(obj);
        setError("");
        setStatus("");
      } catch (err) {
        setParsed(null);
        setError(err.message || "Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const handleJsonEdit = (value) => {
    setRawJson(value);
    try {
      const obj = JSON.parse(value);
      validateJson(obj);
      setParsed(obj);
      setError("");
    } catch (err) {
      setParsed(null);
      setError(err.message || "Invalid JSON");
    }
  };



const generateCypher = () => {
  if (!parsed) return "";

  const toCypherMap = (obj) => {
    if (!obj || Object.keys(obj).length === 0) return "{}";
    const pairs = Object.entries(obj).map(([k, v]) => {
      const val =
        typeof v === "string" ? `"${v.replace(/"/g, '\\"')}"` : v;
      return `${k}: ${val}`;
    });
    return `{${pairs.join(", ")}}`;
  };

  const nodeLines = parsed.nodes.map((n) => {
    const entries = Object.entries(n.properties || {});
    if (entries.length === 0) {
      throw new Error(`Node ${n.tempId} has no properties to merge on`);
    }

    const [key, value] = entries[0]; // identity key
    const val =
      typeof value === "string"
        ? `"${value.replace(/"/g, '\\"')}"`
        : value;

    return `
MERGE (${n.tempId}:${n.label} { ${key}: ${val} })
SET ${n.tempId} += ${toCypherMap(n.properties)}
`;
  });

  const relLines = parsed.relationships.map(
    (r) => `
MERGE (${r.from})-[rel_${r.from}_${r.to}:${r.type}]->(${r.to})
SET rel_${r.from}_${r.to} += ${toCypherMap(r.properties || {})}
`
  );

  const cypher = `
${nodeLines.join("\n")}
WITH ${parsed.nodes.map((n) => n.tempId).join(", ")}
${relLines.join("\n")}
`;

  console.log("Generated Cypher:\n", cypher);
  return cypher;
};






  const pushToNeo4j = async () => {
    if (!parsed) return;

    setLoading(true);
    setStatus("");
    try {
      const uri = sessionStorage.getItem("neo4j_uri");
      const username = sessionStorage.getItem("neo4j_username");
      const password = sessionStorage.getItem("neo4j_password");

      if (!uri || !username || !password) {
        throw new Error("Neo4j connection not found. Please reconnect.");
      }

      const cypher = generateCypher();

const res = await fetch("http://localhost:3001/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cypher,
    uri,
    username,
    password,
  }),
});

if (!res.ok) {
  const errorData = await res.json();
  throw new Error(errorData.error || "Neo4j insertion failed");
}

const response = await res.json();
setStatus("✅ Data inserted successfully into Neo4j");}

catch (err) {
      setStatus("❌ " + (err.message || "Insertion failed"));
      console.log(err.message)
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="json-import-container">
      <h1>Import JSON → Neo4j</h1>

      <p className="helper-text">
        Upload a JSON file containing nodes and relationships. You can edit it
        before inserting.
      </p>

      <input type="file" accept=".json" onChange={handleFileUpload} />

      <textarea
        className="json-preview"
        placeholder="JSON preview / edit area"
        value={rawJson}
        onChange={(e) => handleJsonEdit(e.target.value)}
      />

      {error && <div className="error-box">{error}</div>}

      <div className="button-row">
        <button
          disabled={!parsed || !!error || loading}
          onClick={pushToNeo4j}
        >
          {loading ? "Inserting..." : "Confirm & Insert"}
        </button>

        <button className="secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {status && <div className="status-box">{status}</div>}
    </div>
  );
}
