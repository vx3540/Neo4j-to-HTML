require("dotenv").config();

const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const { authMiddleware, SECRET } = require("./middleware");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.post("/connect", authMiddleware, async (req, res) => {
  let { uri, username, password } = req.body;

  if (!uri) {
    const user = await new Promise((resolve) => {
      db.get(
        "SELECT neo4j_uri, neo4j_username, neo4j_password FROM users WHERE id=?",
        [req.user.id],
        (err, row) => {
          if (err) return resolve(null);
          resolve(row);
        }
      );
    });

    if (!user || !user.neo4j_uri) {
      return res.status(400).json({ error: "No saved credentials found" });
    }

    uri = user.neo4j_uri;
    username = user.neo4j_username;
    password = user.neo4j_password;
  }
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
app.post("/query", authMiddleware, async (req, res) => {
  let { cypher, uri, username, password } = req.body;

  if (!uri) {
    const user = await new Promise((resolve) => {
      db.get(
        "SELECT neo4j_uri, neo4j_username, neo4j_password FROM users WHERE id=?",
        [req.user.id],
        (err, row) => {
          if (err) return resolve(null);
          resolve(row);
        }
      );
    });

    if (!user || !user.neo4j_uri) {
      return res.status(400).json({ error: "No saved credentials found" });
    }

    uri = user.neo4j_uri;
    username = user.neo4j_username;
    password = user.neo4j_password;

    // In /query, after the DB lookup:
console.log("Fetched user creds:", user);
  }
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

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "User already exists" });
      }
      res.json({ success: true });
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id }, SECRET);

    res.json({ token });
  });
});

app.get("/me", authMiddleware, (req, res) => {
  db.get(
    "SELECT neo4j_uri, neo4j_username, neo4j_password FROM users WHERE id = ?",
    [req.user.id],
    (err, user) => {
      if (!user) return res.json({});
      res.json(user);
    }
  );
});

app.post("/save-connection", authMiddleware, (req, res) => {
  const { uri, username, password } = req.body;

  db.run(
    `UPDATE users 
     SET neo4j_uri=?, neo4j_username=?, neo4j_password=? 
     WHERE id=?`,
    [uri, username, password, req.user.id],
    () => {
      res.json({ success: true });
    }
  );
});

app.post("/sendContribution", authMiddleware, (req, res) => {
  // your handler
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
