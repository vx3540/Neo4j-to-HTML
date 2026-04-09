import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfigurationView, { ConfigurationLoadingView } from "./components/ConfigurationView";
import { NODE_TEMPLATES } from "./constants/nodeTemplates";
import {
  buildNodeConfigQuery,
  buildRelationshipConfigQuery,
  fetchConnectionLabels,
  fetchSavedConnections,
  runConfigurationQuery,
  saveConnectionRecord,
  sendContributionText,
} from "./utils/configurationUtils";

// Manages Neo4j connections and node/relationship configuration from the UI.
const ConfigurationPage = () => {
  const [uri, setUri] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [nodes, setNodes] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connections, setConnections] = useState([]);

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [configType, setConfigType] = useState("");
  const [configLabel, setConfigLabel] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [nodeProperties, setNodeProperties] = useState({});
  const [configMessage, setConfigMessage] = useState("");
  const [relNode1Label, setRelNode1Label] = useState("");
  const [relNode1Prop, setRelNode1Prop] = useState("");
  const [relNode2Label, setRelNode2Label] = useState("");
  const [relNode2Prop, setRelNode2Prop] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showContribution, setShowContribution] = useState(false);
  const [contributionText, setContributionText] = useState("");
  const [contributionMessage, setContributionMessage] = useState("");

useEffect(() => {
  // Restores saved credentials from session storage on first load.
  const savedUri = sessionStorage.getItem("neo4j_uri");
  const savedUsername = sessionStorage.getItem("neo4j_username");
  const savedPassword = sessionStorage.getItem("neo4j_password");

  if (savedUri && savedUsername && savedPassword) {
    setUri(savedUri);
    setUsername(savedUsername);
    setPassword(savedPassword);
    setConnected(true);

    fetchLabelsWithCredentials(savedUri, savedUsername, savedPassword);
  }
}, []);
useEffect(() => {
  // Applies a selected template by seeding label and property fields.
  if (!selectedTemplate) {
    setConfigLabel("");
    setNodeProperties({ name: "" });
    return;
  }

  const template = NODE_TEMPLATES[selectedTemplate];
  if (!template) return;

  setConfigLabel(template.label);

  const freshProps = {};
  template.fields.forEach((field) => {
    freshProps[field] = "";
  });

  setNodeProperties(freshProps);

}, [selectedTemplate]);

useEffect(() => {
  // Loads saved database connections for quick reconnect.
  fetchSavedConnections().then(setConnections);
}, []);

useEffect(() => {
  // Enforces authentication by redirecting when token is missing.
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
  }
}, []);

// Fetches available node labels using explicitly provided credentials.
const fetchLabelsWithCredentials = async (customUri, customUsername, customPassword) => {
  try {
    const { response, data } = await fetchConnectionLabels({
      uri: customUri,
      username: customUsername,
      password: customPassword,
    });

    if (!response.ok) throw new Error("Failed to fetch labels");

    setNodes(data.labels.map((label) => ({ label })));
  } catch (err) {
    console.error("Error fetching labels:", err);
  }
};

// Fetches available node labels using the current credential state.
const fetchLabels = async () => {
  try {
    const { response, data } = await fetchConnectionLabels({
      uri,
      username,
      password,
    });

    if (!response.ok) throw new Error("Failed to fetch labels");

    const labels = data.labels.map((label) => ({ label }));

    setNodes(labels);
  } catch (err) {
    console.error("Error fetching labels:", err);
  }
};


// Sends user contribution text to the backend contribution endpoint.
const handleSendContribution = async () => {
  try {
    const data = await sendContributionText({
      text: contributionText,
    });

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



// Connects to Neo4j, loads labels, and persists successful connections.
const connectToNeo4j = async (customUri, customUsername, customPassword) => {
  setError("");
  setLoading(true);
  console.log("Connecting with:", { uri, username, password });
  try {
    const { response, data } = await fetchConnectionLabels({
      uri: customUri || uri,
      username: customUsername || username,
      password: customPassword || password,
    });

    console.log("Response OK:", response.ok);
console.log("Response Data:", data);

    if (response.ok) {
      setNodes(data.labels.map((label) => ({ label })));
      setConnected(true);
      setError("");
      if (!connections.some(c => c.uri === (customUri || uri) && c.username === (customUsername || username))) {
        await saveConnectionRecord({
          uri: customUri || uri,
          username: customUsername || username,
          password: customPassword || password,
          name: connectionName.trim() || customUri || uri,
        });

        setConnections(await fetchSavedConnections());
      }
    } else {
      setError(data.error || "Failed to connect.");
      if (!response.ok) {
  console.error("Backend error:", data);
}
      
    }  
  } catch (err) {
    setError("Failed to connect. Check your backend/server.");
    console.error("Connection error:", err);
  } finally {
    setLoading(false);
  }
};

  // Removes a node property field while keeping at least one field present.
  const handleDeleteField = (fieldName) => {
    setNodeProperties((prev) => {
      const updated = { ...prev };

      if (Object.keys(updated).length <= 1) {
        return updated;
      }

      delete updated[fieldName];
      return updated;
    });
  };


  // Creates a node or relationship configuration based on current form values.
  const handleAddConfig = async () => {
    setConfigMessage("");

    if (
      !configLabel ||
      (configType === "node" &&
        Object.values(nodeProperties).every((v) => v === ""))
    ) {
      setConfigMessage("Please provide label and at least one property.");
      return;
    }

    try {
      let query = "";

    if (configType === "node") {
      query = buildNodeConfigQuery({
        configLabel,
        nodeProperties,
      });
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

        query = buildRelationshipConfigQuery({
          relNode1Label,
          relNode1Prop,
          relNode2Label,
          relNode2Prop,
          configLabel,
        });
      }
      console.log("Connecting with:", { uri, username, password });
      const { response, data } = await runConfigurationQuery({
        cypher: query,
        uri,
        username,
        password,
      });

      if (response.ok) {
        setConfigMessage("Successfully added.");
        setSelectedTemplate("");
        setNodeProperties({ name: "" });
      } else {
        setConfigMessage(data.error || "Failed to add. Please check input.");
      }
    } catch (err) {
      setConfigMessage("Error occurred while adding.");
      console.error("Add Config Error:", err);
    }
  };

  // Clears auth/session credentials and redirects to login.
  const handleLogout = () => {
    localStorage.removeItem("token");
sessionStorage.removeItem("neo4j_uri");
sessionStorage.removeItem("neo4j_username");
sessionStorage.removeItem("neo4j_password");
    window.location.href = "/login";
  };

// Navigates to full graph browsing mode with current credentials.
const handleBrowseFullGraph = () => {
  sessionStorage.setItem("neo4j_uri", uri);
  sessionStorage.setItem("neo4j_username", username);
  sessionStorage.setItem("neo4j_password", password);

  navigate("/cypherquerytester", {
    state: {
      browseFullGraph: true,
      uri,
      username,
      password,
    },
  });
};

// Navigates to node-specific graph exploration for the clicked node label.
const handleNodeClick = (node) => {
  localStorage.setItem("nodeLabel", node.label);
  sessionStorage.setItem("neo4j_uri", uri);
  sessionStorage.setItem("neo4j_username", username);
  sessionStorage.setItem("neo4j_password", password);
  navigate("/cypherquerytester", {
    state: {
      selectedNode: node,
      uri,
      username,
      password,
    },
  });
};

// Applies a selected saved connection into current connection form fields.
const handleSavedConnectionSelect = (connectionId) => {
  const selected = connections.find((c) => c.id == connectionId);
  if (!selected) return;

  setUri(selected.uri);
  setUsername(selected.username);
  setPassword(selected.password || "");
  setConnectionName(selected.name || "");
};

// Toggles password field visibility in the connect form.
const handleTogglePasswordVisibility = () => {
  setShowPassword((prev) => !prev);
};

// Opens the manual configuration panel and hides contribution panel.
const handleShowManualConfig = () => {
  setShowConfig(true);
  setShowContribution(false);
};

// Navigates to the JSON import flow.
const handleImportJson = () => {
  navigate("/import-json");
};

// Normalizes and updates configuration type while resetting dependent fields.
const handleConfigTypeChange = (value) => {
  setConfigType(value);
  setConfigLabel("");
  setSelectedTemplate("");
  setNodeProperties({ name: "" });
  setConfigMessage("");
};

// Normalizes configuration label by stripping whitespace.
const handleConfigLabelChange = (value) => {
  setConfigLabel(value.replace(/\s+/g, ""));
};

// Prompts for and adds a new node property field.
const handleAddNodeField = () => {
  const newField = prompt("Enter new field name:");
  if (!newField) return;

  const cleanedField = newField.trim().replace(/\s+/g, "");
  if (!cleanedField) return;

  if (nodeProperties[cleanedField]) {
    alert("Field already exists.");
    return;
  }

  setNodeProperties({
    ...nodeProperties,
    [cleanedField]: "",
  });
};

// Updates a specific node property value in state.
const handleNodePropertyChange = (field, value) => {
  setNodeProperties({
    ...nodeProperties,
    [field]: value,
  });
};


if (loading) {
  return <ConfigurationLoadingView />;
}

  return (
    <ConfigurationView
      connected={connected}
      onLogout={handleLogout}
      connections={connections}
      onSavedConnectionSelect={handleSavedConnectionSelect}
      connectionName={connectionName}
      onConnectionNameChange={setConnectionName}
      uri={uri}
      onUriChange={setUri}
      username={username}
      onUsernameChange={setUsername}
      password={password}
      onPasswordChange={setPassword}
      showPassword={showPassword}
      onTogglePassword={handleTogglePasswordVisibility}
      onConnect={() => connectToNeo4j()}
      loading={loading}
      error={error}
      nodes={nodes}
      onBrowseFullGraph={handleBrowseFullGraph}
      onNodeClick={handleNodeClick}
      onShowManualConfig={handleShowManualConfig}
      onImportJson={handleImportJson}
      showConfig={showConfig}
      configType={configType}
      onConfigTypeChange={handleConfigTypeChange}
      configLabel={configLabel}
      onConfigLabelChange={handleConfigLabelChange}
      selectedTemplate={selectedTemplate}
      onSelectedTemplateChange={setSelectedTemplate}
      nodeProperties={nodeProperties}
      onAddNodeField={handleAddNodeField}
      onNodePropertyChange={handleNodePropertyChange}
      onDeleteField={handleDeleteField}
      relNode1Label={relNode1Label}
      onRelNode1LabelChange={setRelNode1Label}
      relNode1Prop={relNode1Prop}
      onRelNode1PropChange={setRelNode1Prop}
      relNode2Label={relNode2Label}
      onRelNode2LabelChange={setRelNode2Label}
      relNode2Prop={relNode2Prop}
      onRelNode2PropChange={setRelNode2Prop}
      onAddConfig={handleAddConfig}
      configMessage={configMessage}
      showContribution={showContribution}
      contributionText={contributionText}
      onContributionTextChange={setContributionText}
      onSendContribution={handleSendContribution}
      contributionMessage={contributionMessage}
    />
  );

};

export default ConfigurationPage;