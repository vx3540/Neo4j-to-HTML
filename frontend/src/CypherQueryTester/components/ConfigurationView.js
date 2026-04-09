import SimpleSelect from "./SimpleSelect";

// Renders a loading screen while a Neo4j connection is being established.
export const ConfigurationLoadingView = () => {
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
};

// Renders the sticky top header and logout action.
const ConfigurationHeader = ({ onLogout }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: 0, color: "#333" }}>Neo4j Explorer</h3>

      <button
        onClick={onLogout}
        style={{
          padding: "0.5rem 1rem",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        Logout
      </button>
    </div>
  );
};

// Renders the connection form shown before Neo4j is connected.
const DisconnectedConnectionCard = ({
  connections,
  onSavedConnectionSelect,
  connectionName,
  onConnectionNameChange,
  uri,
  onUriChange,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  onConnect,
  loading,
  error,
}) => {
  return (
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
        Connect to your Neo4j Database!
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
        <select
          onChange={(e) => onSavedConnectionSelect(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <option value="">Select saved connection</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name && c.name !== c.uri ? `${c.name} — ${c.uri}` : c.uri}
            </option>
          ))}
        </select>

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
          placeholder="Connection name (e.g., My Production DB)"
          value={connectionName}
          onChange={(e) => onConnectionNameChange(e.target.value)}
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
          placeholder="Neo4j URI (e.g., neo4j+s://example.com)"
          value={uri}
          onChange={(e) => onUriChange(e.target.value)}
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
          onChange={(e) => onUsernameChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
          />
          <button
            type="button"
            onClick={onTogglePassword}
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
          onClick={onConnect}
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
  );
};

// Renders the available node list and full graph browse action.
const AvailableNodeTypesCard = ({ nodes, onBrowseFullGraph, onNodeClick }) => {
  return (
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
          onClick={onBrowseFullGraph}
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
            onClick={() => onNodeClick(node)}
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
  );
};

// Renders action buttons for opening manual configuration and JSON import.
const ConfigurationActions = ({ onShowManualConfig, onImportJson }) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "80rem",
        margin: "3rem auto 2rem auto",
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={onShowManualConfig}
        style={{
          background: "#16a34a",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.95rem",
          boxShadow: "0 6px 12px rgba(22, 163, 74, 0.4)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#15803d")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#16a34a")}
      >
        Add Configuration Manually
      </button>

      <button
        onClick={onImportJson}
        style={{
          background: "#2563eb",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.95rem",
          boxShadow: "0 6px 12px rgba(37, 99, 235, 0.4)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
      >
        Import from JSON
      </button>
    </div>
  );
};

// Renders the manual node/relationship configuration form.
const ManualConfigurationPanel = ({
  showConfig,
  configType,
  onConfigTypeChange,
  configLabel,
  onConfigLabelChange,
  selectedTemplate,
  onSelectedTemplateChange,
  nodeProperties,
  onAddNodeField,
  onNodePropertyChange,
  onDeleteField,
  relNode1Label,
  onRelNode1LabelChange,
  relNode1Prop,
  onRelNode1PropChange,
  relNode2Label,
  onRelNode2LabelChange,
  relNode2Prop,
  onRelNode2PropChange,
  onAddConfig,
  configMessage,
}) => {
  if (!showConfig) return null;

  return (
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
          selectOnMouseDown={true}
          useAriaRoles={true}
          value={configType}
          onChange={onConfigTypeChange}
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
              placeholder={configType === "node" ? "Node Label" : "Relationship Type"}
              value={configLabel}
              onChange={(e) => onConfigLabelChange(e.target.value)}
            />

            {configType === "node" ? (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Select Template:</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => onSelectedTemplateChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginTop: "0.5rem",
                    }}
                  >
                    <option value="">Other</option>
                    <option value="Book">Book</option>
                    <option value="Painting">Painting</option>
                    <option value="DancePerformance">Dance Performance</option>
                    <option value="MusicPerformance">Music Performance</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onAddNodeField}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: "1rem",
                  }}
                >
                  Add Field
                </button>

                {Object.keys(nodeProperties).map((field) => (
                  <div
                    key={field}
                    style={{
                      marginBottom: "0.75rem",
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label>{field}</label>
                      <input
                        type="text"
                        value={nodeProperties[field]}
                        onChange={(e) => onNodePropertyChange(field, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          marginTop: "0.25rem",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteField(field)}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0.5rem 0.75rem",
                        cursor: "pointer",
                        height: "40px",
                        marginTop: "1.5rem",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
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
                  onChange={(e) => onRelNode1LabelChange(e.target.value)}
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
                  onChange={(e) => onRelNode1PropChange(e.target.value)}
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
                  onChange={(e) => onRelNode2LabelChange(e.target.value)}
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
                  onChange={(e) => onRelNode2PropChange(e.target.value)}
                />
              </>
            )}

            <button
              onClick={onAddConfig}
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
  );
};

// Renders the optional contribution text submission panel.
const ContributionPanel = ({
  showContribution,
  contributionText,
  onContributionTextChange,
  onSendContribution,
  contributionMessage,
}) => {
  if (!showContribution) return null;

  return (
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
        onChange={(e) => onContributionTextChange(e.target.value)}
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
        onClick={onSendContribution}
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
  );
};

// Renders the connected-state content including graph actions and configuration forms.
const ConnectedContent = ({
  nodes,
  onBrowseFullGraph,
  onNodeClick,
  onShowManualConfig,
  onImportJson,
  showConfig,
  configType,
  onConfigTypeChange,
  configLabel,
  onConfigLabelChange,
  selectedTemplate,
  onSelectedTemplateChange,
  nodeProperties,
  onAddNodeField,
  onNodePropertyChange,
  onDeleteField,
  relNode1Label,
  onRelNode1LabelChange,
  relNode1Prop,
  onRelNode1PropChange,
  relNode2Label,
  onRelNode2LabelChange,
  relNode2Prop,
  onRelNode2PropChange,
  onAddConfig,
  configMessage,
  showContribution,
  contributionText,
  onContributionTextChange,
  onSendContribution,
  contributionMessage,
}) => {
  return (
    <>
      <AvailableNodeTypesCard
        nodes={nodes}
        onBrowseFullGraph={onBrowseFullGraph}
        onNodeClick={onNodeClick}
      />

      <ConfigurationActions
        onShowManualConfig={onShowManualConfig}
        onImportJson={onImportJson}
      />

      <ManualConfigurationPanel
        showConfig={showConfig}
        configType={configType}
        onConfigTypeChange={onConfigTypeChange}
        configLabel={configLabel}
        onConfigLabelChange={onConfigLabelChange}
        selectedTemplate={selectedTemplate}
        onSelectedTemplateChange={onSelectedTemplateChange}
        nodeProperties={nodeProperties}
        onAddNodeField={onAddNodeField}
        onNodePropertyChange={onNodePropertyChange}
        onDeleteField={onDeleteField}
        relNode1Label={relNode1Label}
        onRelNode1LabelChange={onRelNode1LabelChange}
        relNode1Prop={relNode1Prop}
        onRelNode1PropChange={onRelNode1PropChange}
        relNode2Label={relNode2Label}
        onRelNode2LabelChange={onRelNode2LabelChange}
        relNode2Prop={relNode2Prop}
        onRelNode2PropChange={onRelNode2PropChange}
        onAddConfig={onAddConfig}
        configMessage={configMessage}
      />

      <ContributionPanel
        showContribution={showContribution}
        contributionText={contributionText}
        onContributionTextChange={onContributionTextChange}
        onSendContribution={onSendContribution}
        contributionMessage={contributionMessage}
      />
    </>
  );
};

// Renders the full configuration page layout based on connection state.
export default function ConfigurationView({
  connected,
  onLogout,
  connections,
  onSavedConnectionSelect,
  connectionName,
  onConnectionNameChange,
  uri,
  onUriChange,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  onConnect,
  loading,
  error,
  nodes,
  onBrowseFullGraph,
  onNodeClick,
  onShowManualConfig,
  onImportJson,
  showConfig,
  configType,
  onConfigTypeChange,
  configLabel,
  onConfigLabelChange,
  selectedTemplate,
  onSelectedTemplateChange,
  nodeProperties,
  onAddNodeField,
  onNodePropertyChange,
  onDeleteField,
  relNode1Label,
  onRelNode1LabelChange,
  relNode1Prop,
  onRelNode1PropChange,
  relNode2Label,
  onRelNode2LabelChange,
  relNode2Prop,
  onRelNode2PropChange,
  onAddConfig,
  configMessage,
  showContribution,
  contributionText,
  onContributionTextChange,
  onSendContribution,
  contributionMessage,
}) {
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
      <ConfigurationHeader onLogout={onLogout} />

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
          <DisconnectedConnectionCard
            connections={connections}
            onSavedConnectionSelect={onSavedConnectionSelect}
            connectionName={connectionName}
            onConnectionNameChange={onConnectionNameChange}
            uri={uri}
            onUriChange={onUriChange}
            username={username}
            onUsernameChange={onUsernameChange}
            password={password}
            onPasswordChange={onPasswordChange}
            showPassword={showPassword}
            onTogglePassword={onTogglePassword}
            onConnect={onConnect}
            loading={loading}
            error={error}
          />
        ) : (
          <ConnectedContent
            nodes={nodes}
            onBrowseFullGraph={onBrowseFullGraph}
            onNodeClick={onNodeClick}
            onShowManualConfig={onShowManualConfig}
            onImportJson={onImportJson}
            showConfig={showConfig}
            configType={configType}
            onConfigTypeChange={onConfigTypeChange}
            configLabel={configLabel}
            onConfigLabelChange={onConfigLabelChange}
            selectedTemplate={selectedTemplate}
            onSelectedTemplateChange={onSelectedTemplateChange}
            nodeProperties={nodeProperties}
            onAddNodeField={onAddNodeField}
            onNodePropertyChange={onNodePropertyChange}
            onDeleteField={onDeleteField}
            relNode1Label={relNode1Label}
            onRelNode1LabelChange={onRelNode1LabelChange}
            relNode1Prop={relNode1Prop}
            onRelNode1PropChange={onRelNode1PropChange}
            relNode2Label={relNode2Label}
            onRelNode2LabelChange={onRelNode2LabelChange}
            relNode2Prop={relNode2Prop}
            onRelNode2PropChange={onRelNode2PropChange}
            onAddConfig={onAddConfig}
            configMessage={configMessage}
            showContribution={showContribution}
            contributionText={contributionText}
            onContributionTextChange={onContributionTextChange}
            onSendContribution={onSendContribution}
            contributionMessage={contributionMessage}
          />
        )}
      </div>
    </div>
  );
}
