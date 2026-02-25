const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to database:", err.stack);
  } else {
    console.log("Successfully connected to database");
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
