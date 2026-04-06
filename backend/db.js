const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./users.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      neo4j_uri TEXT,
      neo4j_username TEXT,
      neo4j_password TEXT
    )
  `);
  db.run(`
  CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    uri TEXT,
    username TEXT,
    password TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
});

module.exports = db;
