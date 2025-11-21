import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve("src/backend/.env")
});

console.log("TESTE CLIENT ENV:", process.env);

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function test() {
  try {
    await client.connect();
    console.log("CONEXÃO OK ✔");
    await client.end();
  } catch (err) {
    console.error("ERRO NO CLIENT:", err);
  }
}

test();
