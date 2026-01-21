/**
 * T053: User Service (create, get, update)
 * T053a: User Identity Linking Service
 *
 * Implements user CRUD operations and identity linking for merging
 * accounts created via different auth methods (OTP vs OAuth) with the same email.
 */

import { notFound, databaseError } from '../lib/errors'

/**
 * User record structure from database.
 */
export interface UserRecord {
  id: string
  email: string
  email_verified: number // SQLite boolean (0 or 1)
  auth_method: 'email' | 'oauth'
  auth_provider: string | null
  auth_provider_id: string | null
  kdf_salt: string | null
  key_verifier: string | null
  storage_used: number
  storage_limit: number
  created_at: number
  updated_at: number
}

/**
 * User identity record structure.
 */
export interface UserIdentityRecord {
  id: string
  user_id: string
  provider: string
  provider_id: string
  created_at: number
}

/**
 * Public user data (safe to return in API responses).
 */
export interface UserPublic {
  id: string
  email: string
  emailVerified: boolean
  authMethod: 'email' | 'oauth'
  authProvider?: 'google'
  storageUsed: number
  storageLimit: number
  createdAt: number
  updatedAt: number
}

/**
 * Input for creating a new user.
 */
export interface CreateUserInput {
  email: string
  emailVerified?: boolean
  authMethod: 'email' | 'oauth'
  authProvider?: 'google'
  authProviderId?: string
}

/**
 * Input for updating a user.
 */
export interface UpdateUserInput {
  emailVerified?: boolean
  kdfSalt?: string
  keyVerifier?: string
  storageUsed?: number
}

/**
 * Input for OAuth identity linking.
 */
export interface OAuthIdentityInput {
  email: string
  provider: 'google'
  providerId: string
}

/**
 * Convert a database record to public user format.
 */
function toPublicUser(record: UserRecord): UserPublic {
  return {
    id: record.id,
    email: record.email,
    emailVerified: record.email_verified === 1,
    authMethod: record.auth_method,
    authProvider: record.auth_provider as 'google' | undefined,
    storageUsed: record.storage_used,
    storageLimit: record.storage_limit,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

/**
 * Create a new user in the database.
 *
 * @param db - D1 database instance
 * @param input - User creation input
 * @returns Created user's public data
 */
export async function createUser(db: D1Database, input: CreateUserInput): Promise<UserPublic> {
  const id = crypto.randomUUID()
  const now = Date.now()
  const normalizedEmail = input.email.toLowerCase().trim()

  const result = await db
    .prepare(
      `
      INSERT INTO users (
        id, email, email_verified, auth_method, auth_provider, auth_provider_id,
        storage_used, storage_limit, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 0, 5368709120, ?, ?)
    `
    )
    .bind(
      id,
      normalizedEmail,
      input.emailVerified ? 1 : 0,
      input.authMethod,
      input.authProvider ?? null,
      input.authProviderId ?? null,
      now,
      now
    )
    .run()

  if (!result.success) {
    throw databaseError('Failed to create user')
  }

  const user = await getUserById(db, id)
  if (!user) {
    throw databaseError('User created but not found')
  }

  return user
}

/**
 * Get a user by their ID.
 *
 * @param db - D1 database instance
 * @param id - User ID
 * @returns User's public data or null if not found
 */
export async function getUserById(db: D1Database, id: string): Promise<UserPublic | null> {
  const record = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<UserRecord>()

  return record ? toPublicUser(record) : null
}

/**
 * Get a user by their email address.
 *
 * @param db - D1 database instance
 * @param email - Email address
 * @returns User's public data or null if not found
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<UserPublic | null> {
  const normalizedEmail = email.toLowerCase().trim()

  const record = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(normalizedEmail)
    .first<UserRecord>()

  return record ? toPublicUser(record) : null
}

/**
 * Get internal user record (includes sensitive fields).
 * For internal use only - do not expose in API responses.
 */
export async function getUserRecordByEmail(
  db: D1Database,
  email: string
): Promise<UserRecord | null> {
  const normalizedEmail = email.toLowerCase().trim()

  return await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(normalizedEmail)
    .first<UserRecord>()
}

/**
 * Get internal user record by ID.
 * For internal use only - do not expose in API responses.
 */
export async function getUserRecordById(db: D1Database, id: string): Promise<UserRecord | null> {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRecord>()
}

/**
 * Update a user's data.
 *
 * @param db - D1 database instance
 * @param id - User ID
 * @param input - Fields to update
 * @returns Updated user's public data
 */
export async function updateUser(
  db: D1Database,
  id: string,
  input: UpdateUserInput
): Promise<UserPublic> {
  const now = Date.now()
  const updates: string[] = ['updated_at = ?']
  const values: (string | number | null)[] = [now]

  if (input.emailVerified !== undefined) {
    updates.push('email_verified = ?')
    values.push(input.emailVerified ? 1 : 0)
  }

  if (input.kdfSalt !== undefined) {
    updates.push('kdf_salt = ?')
    values.push(input.kdfSalt)
  }

  if (input.keyVerifier !== undefined) {
    updates.push('key_verifier = ?')
    values.push(input.keyVerifier)
  }

  if (input.storageUsed !== undefined) {
    updates.push('storage_used = ?')
    values.push(input.storageUsed)
  }

  values.push(id)

  const result = await db
    .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  if (!result.success) {
    throw databaseError('Failed to update user')
  }

  const user = await getUserById(db, id)
  if (!user) {
    throw notFound('User')
  }

  return user
}

/**
 * Find or create a user based on OAuth identity.
 *
 * Identity linking logic (T053a):
 * 1. Check if OAuth identity already exists → return existing user
 * 2. Check if user exists with same email (from OTP) → link OAuth identity to existing user
 * 3. Otherwise create new user with OAuth identity
 *
 * This allows users to sign up with email OTP first, then later link their Google account,
 * or vice versa.
 *
 * @param db - D1 database instance
 * @param input - OAuth identity information
 * @returns User's public data
 */
export async function findOrCreateByOAuth(
  db: D1Database,
  input: OAuthIdentityInput
): Promise<UserPublic> {
  const normalizedEmail = input.email.toLowerCase().trim()

  // Step 1: Check if OAuth identity already linked to a user
  const existingIdentity = await db
    .prepare(
      `
      SELECT user_id FROM user_identities
      WHERE provider = ? AND provider_id = ?
    `
    )
    .bind(input.provider, input.providerId)
    .first<{ user_id: string }>()

  if (existingIdentity) {
    const user = await getUserById(db, existingIdentity.user_id)
    if (!user) {
      throw databaseError('Identity exists but user not found')
    }
    return user
  }

  // Step 2: Check if user exists with same email (from OTP signup)
  const existingUser = await getUserByEmail(db, normalizedEmail)

  if (existingUser) {
    // Link OAuth identity to existing user
    await linkIdentity(db, existingUser.id, input.provider, input.providerId)

    // Update user to mark email as verified (OAuth provider verified it)
    if (!existingUser.emailVerified) {
      return await updateUser(db, existingUser.id, { emailVerified: true })
    }

    return existingUser
  }

  // Step 3: Create new user with OAuth
  const newUser = await createUser(db, {
    email: normalizedEmail,
    emailVerified: true, // OAuth provider verified the email
    authMethod: 'oauth',
    authProvider: input.provider,
    authProviderId: input.providerId,
  })

  // Create identity record for the OAuth provider
  await linkIdentity(db, newUser.id, input.provider, input.providerId)

  return newUser
}

/**
 * Find or create a user based on email (for OTP auth).
 *
 * @param db - D1 database instance
 * @param email - Email address
 * @returns Object with user data and whether they're new
 */
export async function findOrCreateByEmail(
  db: D1Database,
  email: string
): Promise<{ user: UserPublic; isNew: boolean }> {
  const normalizedEmail = email.toLowerCase().trim()

  // Check if user exists
  const existingUser = await getUserByEmail(db, normalizedEmail)

  if (existingUser) {
    return { user: existingUser, isNew: false }
  }

  // Create new user
  const newUser = await createUser(db, {
    email: normalizedEmail,
    emailVerified: false, // Will be verified after OTP confirmation
    authMethod: 'email',
  })

  // Create identity record for email
  await linkIdentity(db, newUser.id, 'email', normalizedEmail)

  return { user: newUser, isNew: true }
}

/**
 * Link an identity to a user.
 *
 * @param db - D1 database instance
 * @param userId - User ID
 * @param provider - Identity provider (email, google)
 * @param providerId - Provider-specific ID (email address or OAuth user ID)
 */
export async function linkIdentity(
  db: D1Database,
  userId: string,
  provider: string,
  providerId: string
): Promise<void> {
  const id = crypto.randomUUID()
  const now = Date.now()

  // Check if identity already linked
  const existing = await db
    .prepare(
      `
      SELECT id FROM user_identities
      WHERE provider = ? AND provider_id = ?
    `
    )
    .bind(provider, providerId)
    .first()

  if (existing) {
    // Identity already linked, nothing to do
    return
  }

  await db
    .prepare(
      `
      INSERT INTO user_identities (id, user_id, provider, provider_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
    .bind(id, userId, provider, providerId, now)
    .run()
}

/**
 * Get all identities linked to a user.
 *
 * @param db - D1 database instance
 * @param userId - User ID
 * @returns Array of identity records
 */
export async function getUserIdentities(
  db: D1Database,
  userId: string
): Promise<UserIdentityRecord[]> {
  const result = await db
    .prepare('SELECT * FROM user_identities WHERE user_id = ?')
    .bind(userId)
    .all<UserIdentityRecord>()

  return result.results ?? []
}

/**
 * Check if a user has recovery setup (kdfSalt and keyVerifier stored).
 *
 * @param db - D1 database instance
 * @param userId - User ID
 * @returns True if recovery is set up
 */
export async function hasRecoverySetup(db: D1Database, userId: string): Promise<boolean> {
  const record = await db
    .prepare('SELECT kdf_salt, key_verifier FROM users WHERE id = ?')
    .bind(userId)
    .first<{ kdf_salt: string | null; key_verifier: string | null }>()

  return record !== null && record.kdf_salt !== null && record.key_verifier !== null
}

/**
 * Get recovery data for a user (for recovery phrase restoration).
 *
 * @param db - D1 database instance
 * @param userId - User ID
 * @returns Recovery data or null if not set up
 */
export async function getRecoveryData(
  db: D1Database,
  userId: string
): Promise<{ kdfSalt: string; keyVerifier: string } | null> {
  const record = await db
    .prepare('SELECT kdf_salt, key_verifier FROM users WHERE id = ?')
    .bind(userId)
    .first<{ kdf_salt: string | null; key_verifier: string | null }>()

  if (!record || !record.kdf_salt || !record.key_verifier) {
    return null
  }

  return {
    kdfSalt: record.kdf_salt,
    keyVerifier: record.key_verifier,
  }
}
