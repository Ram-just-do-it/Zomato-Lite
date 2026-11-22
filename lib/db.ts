import { neon } from "@neondatabase/serverless";

// One shared connection to the Neon database.
// DATABASE_URL comes from .env.local on your laptop, or from Vercel's settings when live.
export const sql = neon(process.env.DATABASE_URL!);
