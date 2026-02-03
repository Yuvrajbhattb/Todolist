const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'todos.db');

let db;

// Initialize the database
async function initDatabase() {
  const SQL = await initSqlJs();

  // Check if database file exists
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('✅ Database loaded from file');
  } else {
    db = new SQL.Database();
    console.log('✅ New database created');
  }

  // Create the todos table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    )
  `);

  // Save the database to file
  saveDatabase();
  console.log('✅ Database initialized: todos table ready');
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Execute a query and return results
function executeQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    saveDatabase();
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Execute a query without returning results (INSERT, UPDATE, DELETE)
function executeUpdate(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    const lastId = db.exec("SELECT last_insert_rowid() as id")[0];
    return lastId ? lastId.values[0][0] : null;
  } catch (error) {
    console.error('❌ Database Update Error:');
    console.error('  - SQL:', sql);
    console.error('  - Params:', params);
    console.error('  - Error:', error.message);
    throw error;
  }
}

// Get all rows
function getAllRows(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const result = [];
  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }
  stmt.free();
  return result;
}

module.exports = {
  initDatabase,
  executeQuery,
  executeUpdate,
  getAllRows,
  saveDatabase
};
