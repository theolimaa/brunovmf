import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Wrapper for dynamic parameterized queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sql as any)(text, params) as Promise<T[]>
}
