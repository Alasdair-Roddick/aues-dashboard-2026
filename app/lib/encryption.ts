import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Ensure key is 32 bytes for AES-256
  return crypto.scryptSync(key, 'salt', 32);
}

export function encrypt(text: string): string {
  if (!text) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';

  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    if (!ivHex || !authTagHex || !encrypted) {
      // Return as-is if not in expected format (might be unencrypted)
      return encryptedText;
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return empty string on decryption failure
    return '';
  }
}

// Helper to encrypt an object's values
export function encryptSettings(settings: Record<string, string | null>): Record<string, string | null> {
  const encrypted: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(settings)) {
    encrypted[key] = value ? encrypt(value) : null;
  }
  return encrypted;
}

// Helper to decrypt an object's values
export function decryptSettings(settings: Record<string, string | null>): Record<string, string | null> {
  const decrypted: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(settings)) {
    decrypted[key] = value ? decrypt(value) : null;
  }
  return decrypted;
}
