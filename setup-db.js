// Creates all tables and loads the demo data into your database.
// Run it with:  node setup-db.js
// It uses the same DB settings as the app (from your .env file).
require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "false" ? undefined : { minVersion: "TLSv1.2", rejectUnauthorized: true },
    multipleStatements: true, // lets us run a whole .sql file at once
  });

  console.log("Creating tables...");
  await conn.query(fs.readFileSync("schema-simple.sql", "utf8"));

  const [[{ count }]] = await conn.query("SELECT COUNT(*) AS count FROM services");
  if (count > 0) {
    console.log(`Demo data already loaded (${count} services). Skipping seed.sql.`);
  } else {
    console.log("Loading demo data...");
    await conn.query(fs.readFileSync("seed.sql", "utf8"));
  }

  const [tables] = await conn.query("SHOW TABLES");
  const [[services]] = await conn.query("SELECT COUNT(*) AS n FROM services");
  console.log(`Done! ${tables.length} tables, ${services.n} services.`);
  await conn.end();
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
