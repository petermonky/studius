require("dotenv").config();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "raspberry",
  host: process.env.PG_HOST || "localhost",
  port: 5432,
  database: process.env.PG_DATABASE || "studius",
  ssl: process.env.PG_USER ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
