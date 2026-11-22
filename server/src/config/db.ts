import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("PostgreSQL Connected");
});

pool.on("error", (error) => {
  console.error("Unexpected database error:", error);
});

export default pool;
