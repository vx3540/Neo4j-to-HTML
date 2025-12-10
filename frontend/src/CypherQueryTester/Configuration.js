import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


function SimpleSelect({ value, onChange, options, placeholder = "Select...", style }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: "32rem",
        margin: "0 auto 1.5rem auto",
        position: "relative",
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "0.75rem 1rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "0.95rem",
          background: "#fff",
          color: "#333",
          cursor: "pointer",
        }}
      >
        <span>{current ? current.label : placeholder}</span>
        <span style={{ float: "right" }}>▾</span>
      </button>

      {open && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "0.25rem",
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            maxHeight: "220px",
            overflowY: "auto",
            zIndex: 1000,
          }}
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: value === opt.value ? "#f0f0f0" : "transparent",
                  color: "#333",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    value === opt.value ? "#f0f0f0" : "transparent")
                }
                role="option"
                aria-selected={value === opt.value}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ConfigurationPage = () => {
  const [uri, setUri] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nodes, setNodes] = useState([]);
  const [connected, setConnected] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [configType, setConfigType] = useState("");
  const [configLabel, setConfigLabel] = useState("");
  const [configProps, setConfigProps] = useState("");
  const [configMessage, setConfigMessage] = useState("");
  const [relNode1Label, setRelNode1Label] = useState("");
  const [relNode1Prop, setRelNode1Prop] = useState("");
  const [relNode2Label, setRelNode2Label] = useState("");
  const [relNode2Prop, setRelNode2Prop] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showContribution, setShowContribution] = useState(false);
  const [contributionText, setContributionText] = useState("");


useEffect(() => {
  const storedUri = sessionStorage.getItem("neo4j_uri");
  const storedUsername = sessionStorage.getItem("neo4j_username");
  const storedPassword = sessionStorage.getItem("neo4j_password");
  const storedNodes = sessionStorage.getItem("neo4j_nodes");

  if (storedUri && storedUsername && storedPassword && storedNodes) {
    setUri(storedUri);
    setUsername(storedUsername);
    setPassword(storedPassword);
    setNodes(JSON.parse(storedNodes));
    setConnected(true);
  }
}, []);


const handleSendContribution = async () => {
  try {
    const res = await fetch("http://localhost:3001/sendContribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: contributionText,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Contribution sent successfully!");
      setContributionText("");
    } else {
      alert("Failed to send contribution.");
    }
  } catch (err) {
    console.error(err);
    alert("Error sending contribution.");
  }
};



const connectToNeo4j = async (retry = true) => {
  setError("");
  setLoading(true);
  console.log("Connecting with:", { uri, username, password });
  try {
    const response = await fetch("http://localhost:3001/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uri, username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setNodes(data.labels.map((label) => ({ label })));
      setConnected(true);
      sessionStorage.setItem("neo4j_uri", uri);
      sessionStorage.setItem("neo4j_username", username);
      sessionStorage.setItem("neo4j_password", password);
      sessionStorage.setItem(
        "neo4j_nodes",
        JSON.stringify(data.labels.map((label) => ({ label })))
      );
      setError("");
    } else {
      setError(data.error || "Failed to connect.");
      if (retry) {
        console.log("Retrying Neo4j connection in 3 seconds...");
        setTimeout(() => connectToNeo4j(true), 3000); // Retry after 3s
      }
    }
  } catch (err) {
    setError("Failed to connect. Check your backend/server.");
    console.error("Connection error:", err);
    if (retry) {
      console.log("Retrying Neo4j connection in 3 seconds...");
      setTimeout(() => connectToNeo4j(true), 3000);
    }
  } finally {
    setLoading(false);
  }
};

  const handleAddConfig = async () => {
    setConfigMessage("");

    if (!configLabel) {
      setConfigMessage("Label or type is required.");
      return;
    }

    try {
      let query = "";

      if (configType === "node") {
        query = `CREATE (n:${configLabel} {${configProps}}) RETURN n`;
      }

      if (configType === "relationship") {
        if (
          !relNode1Label ||
          !relNode1Prop ||
          !relNode2Label ||
          !relNode2Prop ||
          !configLabel
        ) {
          setConfigMessage("Please fill all fields for relationship creation.");
          return;
        }

        query = `
          MATCH (a:${relNode1Label} {${relNode1Prop}}), (b:${relNode2Label} {${relNode2Prop}})
          CREATE (a)-[:${configLabel}]->(b)
          RETURN a, b
        `;
      }
      console.log("Connecting with:", { uri, username, password });

      const response = await fetch("http://localhost:3001/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cypher: query, uri, username, password }),
      });


      const data = await response.json();

      if (response.ok) {
        setConfigMessage("Successfully added.");
      } else {
        setConfigMessage(data.error || "Failed to add. Please check input.");
      }
    } catch (err) {
      setConfigMessage("Error occurred while adding.");
      console.error("Add Config Error:", err);
    }
  };
const handleLogout = () => {
  sessionStorage.clear();
  setConnected(false);
  setNodes([]);
  setUri("");
  setUsername("");
  setPassword("");
  navigate("/");
};

  const handleBrowseFullGraph = () => {
    navigate("/cypherquerytester", {
      state: {
        browseFullGraph: true,
        uri,
        username,
        password,
      },
    });
  };


  const handleNodeClick = (node) => {
    navigate("/cypherquerytester", {
      state: {
        selectedNode: node,
        uri,
        username,
        password,
      },
    });
  };


if (loading) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f9f9f9",
        color: "#333",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
          marginBottom: "10px",
        }}
      />
      <p>Connecting to Neo4j...</p>
    </div>
  );
}

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#fff",
        overflowX: "hidden",
        fontFamily: "Open Sans, sans-serif",
        color: "#777",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "2.5rem 1rem",
          position: "relative",
          minHeight: "100vh",
          marginTop: "5rem",
        }}
      >

        {!connected ? (
          <div
            style={{
              width: "100%",
              maxWidth: "40rem",
              background: "#fff",
              border: "1px solid #e5e5e5",
              boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
              borderRadius: "1rem",
              padding: "2.5rem",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: "Craw Modern Bold, sans-serif",
                fontSize: "3rem",
                fontWeight: 800,
                textAlign: "center",
                color: "#333",
                marginBottom: "0.5rem",
              }}
            >
              Welcome
            </h1>

            <p
              style={{
                fontFamily: "Craw Modern Bold, sans-serif",
                color: "#555",
                fontSize: "1.9rem",
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              Connect to the Literary Archive Database!
            </p>

            <p
              style={{
                fontFamily: "Open Sans, sans-serif",
                color: "#777",
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                textAlign: "center",
                lineHeight: "1.6",
              }}
            >
              Once connected, you can add new information and explore the full archive in Neo4j
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: "1rem 1.25rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "1.4rem",
                }}
                type="text"
                placeholder="Neo4j URI (e.g., neo4j+s://example.com)"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
              />
              <input
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: "1rem 1.25rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "1.4rem",
                }}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
                <input
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "1rem 1.25rem",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    fontSize: "1.4rem",
                  }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "#333",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                onClick={connectToNeo4j}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#333",
                  color: "white",
                  padding: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#333")}
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
              {error && (
                <p
                  style={{
                    color: "#a94442",
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                width: "100%",
                maxWidth: "80rem",
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: "1rem",
                boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
                padding: "2.5rem",
                marginTop: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "Craw Modern Bold, sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  textAlign: "center",
                  color: "#333",
                  marginBottom: "1.5rem",
                }}
              >
                Available Node Types
              </h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                
                <button
                  onClick={handleBrowseFullGraph}
                  style={{
                    background: "#333",
                    color: "white",
                    fontSize: "1rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "background 0.2s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "#333")}
                >
                  Browse Full Graph
                </button>
                  <button
    onClick={handleLogout}
    style={{
      background: "#ef4444",
      color: "white",
      fontSize: "1rem",
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
    }}
    onMouseOver={(e) => (e.currentTarget.style.background = "#dc2626")}
    onMouseOut={(e) => (e.currentTarget.style.background = "#ef4444")}
  >
    Logout
  </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                {nodes.map((node, index) => (
                  <div
                    key={index}
                    onClick={() => handleNodeClick(node)}
                    style={{
                      cursor: "pointer",
                      background: "#f9f9f9",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      padding: "1rem",
                      textAlign: "center",
                      color: "#333",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#333";
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#f9f9f9";
                      e.currentTarget.style.color = "#333";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {node.label}
                  </div>
                ))}
              </div>
            </div>

           {/* Buttons to choose mode */}
<div
  style={{
    width: "100%",
    maxWidth: "80rem",
    margin: "3rem auto 2rem auto",
    display: "flex",
    justifyContent: "center",
  }}
>

  <button
    onClick={() => {
      setShowConfig(true);
      setShowContribution(false);
    }}
    style={{
      background: "#16a34a",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Add Configuration
  </button>

</div>

{showConfig && (
  <div
    style={{
      width: "100%",
      maxWidth: "40rem",
      margin: "0 auto",
      background: "#fff",
      border: "1px solid #e5e5e5",
      boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
      borderRadius: "1rem",
      padding: "2rem",
      textAlign: "center",
    }}
  >
    <div
      style={{
        background: "white",
        border: "1px solid #e5e5e5",
        borderRadius: "0.75rem",
        boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
        padding: "2rem",
        width: "100%",
        maxWidth: "80rem",
        marginTop: "1.5rem",
      }}
    >
      <h2
        style={{
          fontFamily: "Craw Modern Bold, sans-serif",
          fontSize: "1.25rem",
          fontWeight: 800,
          textAlign: "center",
          color: "#333",
          marginBottom: "1rem",
        }}
      >
        Configuration
      </h2>

      <SimpleSelect
        value={configType}
        onChange={(val) => {
          setConfigType(val);
          setConfigLabel("");
          setConfigProps("");
          setConfigMessage("");
        }}
        options={[
          { value: "", label: "Select Type" },
          { value: "node", label: "Add Node" },
          { value: "relationship", label: "Add Relationship" },
        ]}
        placeholder="Select Type"
      />

      {configType && (
        <div
          style={{
            width: "100%",
            maxWidth: "42rem",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <input
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.95rem",
            }}
            type="text"
            placeholder={
              configType === "node" ? "Node Label" : "Relationship Type"
            }
            value={configLabel}
            onChange={(e) => setConfigLabel(e.target.value)}
          />

          {configType === "node" ? (
            <input
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "0.95rem",
              }}
              type="text"
              placeholder='Properties (e.g., propertyname: "propertyvalue")'
              value={configProps}
              onChange={(e) => setConfigProps(e.target.value)}
            />
          ) : (
            <>
              <input
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                }}
                type="text"
                placeholder="Start Node Label"
                value={relNode1Label}
                onChange={(e) => setRelNode1Label(e.target.value)}
              />
              <input
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                }}
                type="text"
                placeholder='Start Node Property (e.g., propertyname: "propertyvalue")'
                value={relNode1Prop}
                onChange={(e) => setRelNode1Prop(e.target.value)}
              />
              <input
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                }}
                type="text"
                placeholder="End Node Label"
                value={relNode2Label}
                onChange={(e) => setRelNode2Label(e.target.value)}
              />
              <input
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "0.95rem",
                }}
                type="text"
                placeholder='End Node Property (e.g., propertyname: "propertyvalue")'
                value={relNode2Prop}
                onChange={(e) => setRelNode2Prop(e.target.value)}
              />
            </>
          )}

          <button
            onClick={handleAddConfig}
            style={{
              width: "100%",
              background: "#16a34a",
              color: "white",
              padding: "0.75rem",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#15803d")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#16a34a")}
          >
            Add {configType}
          </button>

          {configMessage && (
            <p
              style={{
                fontSize: "0.875rem",
                textAlign: "center",
                color: "#777",
                marginTop: "0.5rem",
              }}
            >
              {configMessage}
            </p>
          )}
        </div>
      )}
    </div>
  </div>
)}





{showContribution && (
  <div
    style={{
      background: "white",
      border: "1px solid #e5e5e5",
      borderRadius: "0.75rem",
      boxShadow: "0 6px 12px rgba(0,0,0,0.05)",
      padding: "2rem",
      width: "100%",
      maxWidth: "80rem",
      margin: "0 auto 1.5rem auto",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
    <h2
      style={{
        fontFamily: "Craw Modern Bold, sans-serif",
        fontSize: "1.25rem",
        fontWeight: 800,
        textAlign: "center",
        color: "#333",
        marginBottom: "1rem",
      }}
    >
      Contribution
    </h2>
    <textarea
      value={contributionText}
      onChange={(e) => setContributionText(e.target.value)}
      placeholder="Enter details of what you want to add..."
      style={{
        width: "100%",
        minHeight: "150px",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "0.95rem",
        resize: "vertical",
      }}
    />
    <button
      onClick={handleSendContribution}
      style={{
        background: "#2563eb",
        color: "white",
        padding: "0.75rem",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "#1e40af")}
      onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
    >
      Send Contribution
    </button>
    {contributionMessage && (
      <p
        style={{
          fontSize: "0.875rem",
          textAlign: "center",
          color: "#777",
          marginTop: "0.5rem",
        }}
      >
        {contributionMessage}
      </p>
    )}
  </div>
)}

          </>
        )}
      </div>
    </div>
  );
};

export default ConfigurationPage;
