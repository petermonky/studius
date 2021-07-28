require("dotenv").config();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: 5432,
  database: process.env.PG_DATABASE,
  ssl:
    process.env.PG_HOST !== "localhost"
      ? { rejectUnauthorized: false }
      : undefined,
});

module.exports = pool;
