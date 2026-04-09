import React, { useEffect, useState } from "react";
import "./CypherQueryTester.css";
import { useLocation } from "react-router-dom";
import SimpleSelect from "./components/SimpleSelect";
import { buildResultsPageContent } from "./utils/buildResultsPageContent";
import {
  fetchDynamicMenuOptions as getDynamicMenuOptions,
  fetchFullGraphData,
  runCypherQuery,
} from "./utils/cypherQueryApi";

// Renders the graph visualizer page and coordinates query execution flows.
function CypherQueryTester() {
  const { state } = useLocation();
  const {
    selectedNode = {},
    uri = sessionStorage.getItem("neo4j_uri") || localStorage.getItem("neo4j_uri") || "",
    username = sessionStorage.getItem("neo4j_username") || localStorage.getItem("neo4j_username") || "",
    password = sessionStorage.getItem("neo4j_password") || localStorage.getItem("neo4j_password") || "",
    browseFullGraph = false,
  } = state || {};

  const nodeLabel =
  selectedNode?.label || localStorage.getItem("nodeLabel");



  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resultsPageContent, setResultsPageContent] = useState("");
  const [queryType, setQueryType] = useState("");

  const [menuOptions, setMenuOptions] = useState([]);


  // Loads menu options derived from incoming and outgoing relationships for the selected label.
  const fetchDynamicMenuOptions = async () => {
    const options = await getDynamicMenuOptions({
      nodeLabel,
      uri,
      username,
      password,
    });
    if (!options) return;
    setMenuOptions(options);
  };


  // Builds the graph visualization HTML and stores it for iframe rendering.
  const generateResultsPage = (data, options = {}) => {
    const htmlContent = buildResultsPageContent(data, options);
    if (!htmlContent) return;
    setResultsPageContent(htmlContent);
  };

  useEffect(() => {
        // Refreshes menu options whenever the selected label changes.
        if (nodeLabel) {
          fetchDynamicMenuOptions();
        }
      }, [nodeLabel]);

      useEffect(() => {
      // Handles limit update messages from the embedded graph iframe.
      const handleMessage = async (event) => {
        if (event.data?.type === "UPDATE_LIMIT") {
          const { limit } = event.data;
          try {
            const updatedQuery = query.replace(/LIMIT \d+/i, `LIMIT ${limit}`);
            const data = await runCypherQuery({
              cypher: updatedQuery,
              uri,
              username,
              password,
            });

            setResult(data);
            generateResultsPage(data, { allowSelection: browseFullGraph });
          } catch (err) {
            console.error("Error updating limit:", err);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [query, browseFullGraph]);

useEffect(() => {
  // Triggers menu option loading for the currently active label.
  fetchDynamicMenuOptions();
}, [nodeLabel]);

useEffect(() => {
  // Loads and renders the full graph when full-browse mode is active.
  if (browseFullGraph) {
    // Fetches and renders the full graph when browse mode is enabled.
    const fetchFullGraph = async () => {
      try {
        const storedUri = uri || sessionStorage.getItem("neo4j_uri") || localStorage.getItem("neo4j_uri");
        const storedUsername = username || sessionStorage.getItem("neo4j_username") || localStorage.getItem("neo4j_username");
        const storedPassword = password || sessionStorage.getItem("neo4j_password") || localStorage.getItem("neo4j_password");

        const data = await fetchFullGraphData({
          uri: storedUri,
          username: storedUsername,
          password: storedPassword,
        });

        setResult(data);
        generateResultsPage(data, { allowZoom: true, allowSelection: true });
 
      } catch (err) {
        setError("Error loading full graph.");
        console.error("Error:", err);
      }
    };
 
    fetchFullGraph();
  }
}, [browseFullGraph]);


  // Executes the selected Cypher query and renders the result graph.
  const executeQuery = async () => {
    if (!query) {
      setError("Please select a query.");
      return;
    }
    setError(null);

    try {
      console.log("Sending cypher:", query);

      const data = await runCypherQuery({
        cypher: query,
        uri,
        username,
        password,
      });

      setResult(data);
      generateResultsPage(data);
    } catch (err) {
      setError("Error executing query. Please check the backend.");
      console.error("Error:", err);
    }
  };


  // Updates the selected query template based on menu selection.
  const handleQueryTypeChange = (e) => {
    const selectedOption = menuOptions.find((opt) => opt.name === e.target.value);
    setQueryType(e.target.value);
    setQuery(selectedOption ? selectedOption.query : "");
  };

  // Clears session storage and redirects back to the home route.
  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };


return (
    <div
      className="page-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflow: browseFullGraph ? "auto" : "hidden",
      }}
    >
    <div className="header-box">
      <div className="header-text">
        <h1 className="title">Graph Visualiser</h1>
        <p className="subtitle">
          {browseFullGraph ? "Literary Data From Archive" : `Node: ${nodeLabel}`}
        </p>
      </div>

      {error && (
        <p className="error-box">
          {error}
        </p>
      )}

    {!browseFullGraph && (
      <div className="query-controls">
        <SimpleSelect
            value={queryType}
            onChange={(val) => {
              setQueryType(val);

              const selected = menuOptions.find(o => o.value === val);
              if (selected) {
                setQuery(selected.query);
              }
            }}
            options={menuOptions}
          />


        <button
          onClick={executeQuery}
          className="visualize-btn"
        >
          Visualize
        </button>
      </div>
    )}

    </div>

    <div
      className="results-section"
      style={{
        flexGrow: 1,
        width: "100%",
        height: browseFullGraph ? "calc(100vh - 200px)" : "75vh",
        overflowX: browseFullGraph ? "scroll" : "hidden",
        overflowY: browseFullGraph ? "scroll" : "hidden",
      }}
    >

      {resultsPageContent ? (
        <iframe
          srcDoc={resultsPageContent}
          title="Results"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "#fff",
          }}
        ></iframe>

      ) : (
        <div className="results-placeholder">
          Run a query to see graph visualization.
        </div>
      )}
    </div>
  </div>
);

  

}

export default CypherQueryTester;
