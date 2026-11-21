const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: ["DATE"], // return DATE columns as "2026-12-01" (no timezone shift)
  // TiDB Cloud requires SSL. Set DB_SSL=false only for a local MySQL database.
  ssl: process.env.DB_SSL === "false" ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized: true },
});

module.exports = pool;
