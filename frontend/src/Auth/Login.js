import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "../utils/apiBaseUrl";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch(buildApiUrl("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/configuration");
    } else {
      alert(data.error || "Login failed");
    }
  };

return (
  <div
    style={{
      height: "100vh",
      display: "flex",
      background: "#f5f5f5",
      fontFamily: "sans-serif"
    }}
  >
    {/* LEFT SIDE — INFO */}
    <div
      style={{
        flex: 1,
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#111827",
        color: "white"
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Neo4j Explorer
      </h1>

    <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", opacity: 0.9 }}>
    A domain-agnostic platform for exploring and visualizing interconnected data across diverse knowledge systems!
    </p>

    <ul style={{ lineHeight: "1.8", opacity: 0.85 }}>
    <li>🔍 Explore complex graph structures intuitively</li>
    <li>🔗 Navigate relationships across entities</li>
    <li>📊 Interactive, query-driven visualizations</li>
    </ul>
    </div>

    {/* RIGHT SIDE — LOGIN */}
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <h2 style={{ textAlign: "center" }}>Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <button
          onClick={handleLogin}
          style={{
            padding: "0.75rem",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Login
        </button>

        <p style={{ textAlign: "center", fontSize: "0.9rem" }}>
          Don’t have an account?{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register!
          </span>
        </p>
      </div>
    </div>
  </div>
);
}