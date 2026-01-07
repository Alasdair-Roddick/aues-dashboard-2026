// filename: lib/server/password.ts
import argon2 from 'argon2'

/**
 * Hash a password using Argon2id.
 * Argon2id is recommended to mitigate both GPU side-channel attacks and
 * provide balanced defense against brute-force. Parameters chosen aim for
 * reasonable security while staying performant on typical server hardware.
 *
 * Note: Keep this code server-side only (Node runtime). Do not bundle into client.
 */
export async function saltAndHashPassword(password: string): Promise<string> {
  // Default argon2.hash uses argon2id if not overridden; we set explicit params.
  // Adjust memoryCost/timeCost/parallelism based on your server resources and latency target.
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,     // 64 MiB
    timeCost: 3,             // iterations
    parallelism: 1,          // threads; raise if you have spare cores
  })
  return hash
}

/**
 * Verify a plaintext password against a stored Argon2 hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}
