const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.post("/connect", async (req, res) => {
  const { uri, username, password } = req.body;
if (!/^neo4j(\+s|\+ssc)?:\/\//.test(uri) && !/^bolt(\+s|\+ssc)?:\/\//.test(uri)) {
  return res.status(400).json({
    error: "Invalid Neo4j URI scheme. Use neo4j:// or neo4j+s://",
  });
}

  if (!uri || !username || !password) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  try {
    const result = await session.run("CALL db.labels()");
    const labels = result.records.map((record) => record.get(0));
    res.json({ labels });
  } catch (error) {
    console.error("Error connecting to Neo4j:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
    await driver.close();
  }
});
app.post("/query", async (req, res) => {
  const { cypher, uri, username, password } = req.body;
if (!/^neo4j(\+s|\+ssc)?:\/\//.test(uri) && !/^bolt(\+s|\+ssc)?:\/\//.test(uri)) {
  return res.status(400).json({
    error: "Invalid Neo4j URI scheme. Use neo4j:// or neo4j+s://",
  });
}

  if (!cypher || !uri || !username || !password) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session();

  try {
    const result = await session.run(cypher);
    const data = result.records.map((record) => record.toObject());
    res.json(data);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
    await driver.close(); 
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
