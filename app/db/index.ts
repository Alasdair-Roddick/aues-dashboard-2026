import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

let _db: ReturnType<typeof drizzle> | null = null

function initDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set')
    }

    const sql = neon(process.env.DATABASE_URL)
    _db = drizzle(sql)
  }
  return _db
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return initDb()[prop as keyof ReturnType<typeof drizzle>]
  },
})
