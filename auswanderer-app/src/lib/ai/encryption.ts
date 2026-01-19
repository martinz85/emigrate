/**
 * API Key Encryption Utilities
 *
 * Uses AES-256-GCM for secure encryption of API keys in database.
 * Encryption key must be stored in environment variable.
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Get encryption key from environment
 * Must be exactly 32 bytes (256 bits) for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.AI_KEY_ENCRYPTION_SECRET

  if (!key) {
    throw new Error('AI_KEY_ENCRYPTION_SECRET is not configured')
  }

  // If key is hex-encoded (64 chars), decode it
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex')
  }

  // If key is base64-encoded
  if (key.length === 44 && key.endsWith('=')) {
    return Buffer.from(key, 'base64')
  }

  // Otherwise, derive a key using SHA-256
  return crypto.createHash('sha256').update(key).digest()
}

/**
 * Encrypt an API key for storage in database
 *
 * @param plaintext - The API key to encrypt
 * @returns Base64-encoded encrypted string (iv:authTag:ciphertext)
 */
export function encryptApiKey(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty API key')
  }

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Combine iv, authTag, and ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypt an API key from database
 *
 * @param encryptedData - Base64-encoded encrypted string (iv:authTag:ciphertext)
 * @returns Decrypted API key
 */
export function decryptApiKey(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty data')
  }

  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const [ivBase64, authTagBase64, ciphertext] = parts

  const key = getEncryptionKey()
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Mask an API key for display (e.g., "sk-ant-***...***")
 *
 * @param key - The API key to mask
 * @returns Masked version showing only prefix and suffix
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) {
    return '***'
  }

  const prefix = key.substring(0, 7) // e.g., "sk-ant-"
  const suffix = key.substring(key.length - 4)

  return `${prefix}***...${suffix}`
}

/**
 * Generate a new encryption key (for setup)
 *
 * @returns Hex-encoded 256-bit key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  return !!process.env.AI_KEY_ENCRYPTION_SECRET
}

