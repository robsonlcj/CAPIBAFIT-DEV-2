// src/backend/database/db_connection.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o .env que está na pasta backend
dotenv.config({
  path: path.join(__dirname, "..", ".env")
});


console.log("DEBUG POOL LOAD:", {
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT
});

import pkg from "pg";
const { Pool } = pkg;

// Cria a pool DEPOIS do dotenv carregar
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: false
});

// Função de consulta (só uma!)
export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error("Erro na consulta:", err);
    throw err;
  }
}

export default pool;
