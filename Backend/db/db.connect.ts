import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import "dotenv/config"

const client = new pg.Pool({
  connectionString:process.env.DATABASE_URL,
});

async function connectDB() {
  try {
    await client.connect();
    console.log(" DB Connected Successfully");
  } catch (err) {
    console.error(" Database connection error:", err);
    process.exit(1); // Exit process if DB fails
  }
}

connectDB();
const db = drizzle(client);
export default db;
