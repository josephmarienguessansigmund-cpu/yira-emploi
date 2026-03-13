// ============================================================
// lib/db.ts — Connexion PostgreSQL (DATABASE_URL depuis Netlify env)
// ============================================================
import { Pool } from "pg";

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL n'est pas définie dans les variables d'environnement.");
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }, // Requis pour Neon, Supabase, Railway, etc.
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("[DB] Erreur de pool inattendue:", err);
    });
  }
  return pool;
}

// Utilitaire pour exécuter une requête simple
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const db = getDb();
  const result = await db.query(text, params);
  return result.rows as T[];
}
