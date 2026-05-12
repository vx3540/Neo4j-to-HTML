import { buildApiUrl } from "../../utils/apiBaseUrl";

// Builds authorization headers used by protected backend endpoints.
const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Loads all saved Neo4j connection records for the signed-in user.
export const fetchSavedConnections = async () => {
  const response = await fetch(buildApiUrl("/connections"), {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.json();
};

// Calls the connect endpoint and returns both response metadata and labels payload.
export const fetchConnectionLabels = async ({ uri, username, password }) => {
  const response = await fetch(buildApiUrl("/connect"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      uri,
      username,
      password,
    }),
  });

  const data = await response.json();
  return { response, data };
};

// Persists a new Neo4j connection record for quick reuse.
export const saveConnectionRecord = async ({ uri, username, password, name }) => {
  return fetch(buildApiUrl("/save-connection"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      uri,
      username,
      password,
      name,
    }),
  });
};

// Sends user-contributed configuration notes to the backend service.
export const sendContributionText = async ({ text }) => {
  const response = await fetch(buildApiUrl("/sendContribution"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  return response.json();
};

// Executes a configuration Cypher statement and returns response status with payload.
export const runConfigurationQuery = async ({ cypher, uri, username, password }) => {
  const response = await fetch(buildApiUrl("/query"), {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      cypher,
      uri,
      username,
      password,
    }),
  });

  const data = await response.json();
  return { response, data };
};

// Builds a Cypher CREATE query for node configuration payloads.
export const buildNodeConfigQuery = ({ configLabel, nodeProperties }) => {
  const propsString = Object.entries(nodeProperties)
    .filter(([_, value]) => value !== "")
    .map(([key, value]) => `${key}: "${value.replace(/"/g, '\\\"')}"`)
    .join(", ");

  return `CREATE (n:${configLabel} { ${propsString} }) RETURN n`;
};

// Builds a Cypher CREATE query for relationship configuration payloads.
export const buildRelationshipConfigQuery = ({
  relNode1Label,
  relNode1Prop,
  relNode2Label,
  relNode2Prop,
  configLabel,
}) => {
  return `
          MATCH (a:${relNode1Label} {${relNode1Prop}}), (b:${relNode2Label} {${relNode2Prop}})
          CREATE (a)-[:${configLabel}]->(b)
          RETURN a, b
        `;
};
