// db.js

const { Pool } = require("pg");

// Update with your actual PostgreSQL config
const pool = new Pool({
  user: "postgres.lkqzkeobnicoutrdncwn",
  host: "aws-0-ap-south-1.pooler.supabase.com",
  database: "postgres",
  password: "Nikunj@nikunj32",
  port: 6543,
});

module.exports = pool;
