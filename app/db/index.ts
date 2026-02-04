import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

// Use a placeholder URL during build time - neon doesn't connect until a query is made
const databaseUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@placeholder/placeholder'
const sql = neon(databaseUrl)
export const db = drizzle(sql)
