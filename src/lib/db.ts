import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Wrapper for dynamic parameterized queries
export function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  return sql.query(text, params) as Promise<T[]>
}
