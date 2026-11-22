// Run with: npm run db:setup
// Wipes the two tables, rebuilds them from schema.sql, and fills them from seed.sql.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Is .env.local in the project folder?");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Each file can hold several statements; send them one at a time.
const statements = (file) =>
  readFileSync(new URL(file, import.meta.url), "utf8")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

console.log("Removing old tables (if any)...");
await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");

console.log("Creating tables from db/schema.sql...");
for (const s of statements("./schema.sql")) await sql.query(s);

console.log("Adding starter data from db/seed.sql...");
for (const s of statements("./seed.sql")) await sql.query(s);

console.log("\nTable: restaurants");
console.table(await sql.query("SELECT * FROM restaurants ORDER BY id"));

console.log("Table: reviews");
console.table(await sql.query("SELECT * FROM reviews ORDER BY id"));
