/**
 * T053, T053a: User Service
 *
 * Provides user CRUD operations and identity linking for multiple auth providers.
 * Handles merging accounts when a user authenticates with both OTP and OAuth.
 */

import type { AuthMethod, AuthProvider, User, UserPublic } from '../contracts/sync-api'
import { notFound, databaseError, SyncError, ErrorCode } from '../lib/errors'

interface UserRecord {
  id: string
  email: string
  email_verified: number
  auth_method: AuthMethod
  auth_provider: AuthProvider | null
  auth_provider_id: string | null
  kdf_salt: string | null
  key_verifier: string | null
  storage_used: number
  storage_limit: number
  created_at: number
  updated_at: number
}

interface UserIdentityRecord {
  id: string
  user_id: string
  provider: AuthProvider
  provider_id: string
  email: string
  created_at: number
}

export interface CreateUserParams {
  email: string
  authMethod: AuthMethod
  authProvider?: AuthProvider
  authProviderId?: string
  emailVerified?: boolean
}

export interface UpdateUserParams {
  email?: string
  emailVerified?: boolean
  kdfSalt?: string
  keyVerifier?: string
  storageUsed?: number
}

const DEFAULT_STORAGE_LIMIT = 1024 * 1024 * 1024 // 1GB

const recordToUser = (record: UserRecord): User => ({
  id: record.id,
  email: record.email,
  emailVerified: Boolean(record.email_verified),
  authMethod: record.auth_method,
  authProvider: record.auth_provider ?? undefined,
  authProviderId: record.auth_provider_id ?? undefined,
  kdfSalt: record.kdf_salt ?? undefined,
  keyVerifier: record.key_verifier ?? undefined,
  storageUsed: record.storage_used,
  storageLimit: record.storage_limit,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})

const userToPublic = (user: User): UserPublic => ({
  id: user.id,
  email: user.email,
  emailVerified: user.emailVerified,
  authMethod: user.authMethod,
  authProvider: user.authProvider,
  storageUsed: user.storageUsed,
  storageLimit: user.storageLimit,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
})

/**
 * Create a new user.
 *
 * @param db - D1 database
 * @param params - User creation parameters
 * @returns Created user
 */
export const createUser = async (db: D1Database, params: CreateUserParams): Promise<User> => {
  const id = crypto.randomUUID()
  const now = Date.now()
  const emailVerified = params.emailVerified ?? (params.authMethod === 'oauth' ? 1 : 0)

  await db
    .prepare(
      `INSERT INTO users (
        id, email, email_verified, auth_method, auth_provider, auth_provider_id,
        storage_used, storage_limit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .bind(
      id,
      params.email,
      emailVerified,
      params.authMethod,
      params.authProvider ?? null,
      params.authProviderId ?? null,
      DEFAULT_STORAGE_LIMIT,
      now,
      now
    )
    .run()

  const user = await getUserById(db, id)
  if (!user) {
    throw databaseError('Failed to create user')
  }

  return user
}

/**
 * Get a user by ID.
 *
 * @param db - D1 database
 * @param id - User ID
 * @returns User or null if not found
 */
export const getUserById = async (db: D1Database, id: string): Promise<User | null> => {
  const record = await db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<UserRecord>()

  return record ? recordToUser(record) : null
}

/**
 * Get a user by email.
 *
 * @param db - D1 database
 * @param email - User email
 * @returns User or null if not found
 */
export const getUserByEmail = async (db: D1Database, email: string): Promise<User | null> => {
  const record = await db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .bind(email.toLowerCase())
    .first<UserRecord>()

  return record ? recordToUser(record) : null
}

/**
 * Get a user by OAuth provider ID.
 *
 * @param db - D1 database
 * @param provider - OAuth provider
 * @param providerId - Provider-specific user ID
 * @returns User or null
 */
export const getUserByProviderId = async (
  db: D1Database,
  provider: AuthProvider,
  providerId: string
): Promise<User | null> => {
  const identity = await db
    .prepare(`SELECT user_id FROM user_identities WHERE provider = ? AND provider_id = ?`)
    .bind(provider, providerId)
    .first<{ user_id: string }>()

  if (identity) {
    return getUserById(db, identity.user_id)
  }

  const record = await db
    .prepare(`SELECT * FROM users WHERE auth_provider = ? AND auth_provider_id = ?`)
    .bind(provider, providerId)
    .first<UserRecord>()

  return record ? recordToUser(record) : null
}

/**
 * Update a user.
 *
 * @param db - D1 database
 * @param id - User ID
 * @param params - Fields to update
 * @returns Updated user
 */
export const updateUser = async (
  db: D1Database,
  id: string,
  params: UpdateUserParams
): Promise<User> => {
  const now = Date.now()
  const updates: string[] = ['updated_at = ?']
  const values: (string | number)[] = [now]

  if (params.email !== undefined) {
    updates.push('email = ?')
    values.push(params.email.toLowerCase())
  }

  if (params.emailVerified !== undefined) {
    updates.push('email_verified = ?')
    values.push(params.emailVerified ? 1 : 0)
  }

  if (params.kdfSalt !== undefined) {
    updates.push('kdf_salt = ?')
    values.push(params.kdfSalt)
  }

  if (params.keyVerifier !== undefined) {
    updates.push('key_verifier = ?')
    values.push(params.keyVerifier)
  }

  if (params.storageUsed !== undefined) {
    updates.push('storage_used = ?')
    values.push(params.storageUsed)
  }

  values.push(id)

  await db
    .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  const user = await getUserById(db, id)
  if (!user) {
    throw notFound('User')
  }

  return user
}

/**
 * Find or create a user by email.
 * Used during authentication to handle both new and existing users.
 * Handles identity linking when user authenticates with a new provider.
 *
 * @param db - D1 database
 * @param email - User email
 * @param authMethod - Authentication method used
 * @param provider - OAuth provider (if applicable)
 * @param providerId - OAuth provider user ID (if applicable)
 * @returns User and whether they are new
 */
export const findOrCreateUserByEmail = async (
  db: D1Database,
  email: string,
  authMethod: AuthMethod,
  provider?: AuthProvider,
  providerId?: string
): Promise<{ user: User; isNew: boolean }> => {
  const normalizedEmail = email.toLowerCase()

  const existingUser = await getUserByEmail(db, normalizedEmail)

  if (existingUser) {
    if (provider && providerId) {
      const hasIdentity = await hasLinkedIdentity(db, existingUser.id, provider)
      if (!hasIdentity) {
        await linkIdentity(db, existingUser.id, provider, providerId, normalizedEmail)
      }
    }

    if (authMethod === 'oauth' && !existingUser.emailVerified) {
      await updateUser(db, existingUser.id, { emailVerified: true })
    }

    const updatedUser = await getUserById(db, existingUser.id)
    return { user: updatedUser!, isNew: false }
  }

  const newUser = await createUser(db, {
    email: normalizedEmail,
    authMethod,
    authProvider: provider,
    authProviderId: providerId,
    emailVerified: authMethod === 'oauth'
  })

  if (provider && providerId) {
    await linkIdentity(db, newUser.id, provider, providerId, normalizedEmail)
  }

  return { user: newUser, isNew: true }
}

/**
 * Link an OAuth identity to a user account.
 *
 * @param db - D1 database
 * @param userId - User ID
 * @param provider - OAuth provider
 * @param providerId - Provider-specific user ID
 * @param email - Email from provider (may differ from primary)
 */
export const linkIdentity = async (
  db: D1Database,
  userId: string,
  provider: AuthProvider,
  providerId: string,
  email: string
): Promise<void> => {
  const id = crypto.randomUUID()
  const now = Date.now()

  await db
    .prepare(
      `INSERT INTO user_identities (id, user_id, provider, provider_id, email, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (provider, provider_id) DO NOTHING`
    )
    .bind(id, userId, provider, providerId, email.toLowerCase(), now)
    .run()
}

/**
 * Check if a user has a linked identity for a provider.
 *
 * @param db - D1 database
 * @param userId - User ID
 * @param provider - OAuth provider
 * @returns Whether the identity is linked
 */
export const hasLinkedIdentity = async (
  db: D1Database,
  userId: string,
  provider: AuthProvider
): Promise<boolean> => {
  const identity = await db
    .prepare(`SELECT id FROM user_identities WHERE user_id = ? AND provider = ?`)
    .bind(userId, provider)
    .first()

  return identity !== null
}

/**
 * Get all linked identities for a user.
 *
 * @param db - D1 database
 * @param userId - User ID
 * @returns List of linked identities
 */
export const getLinkedIdentities = async (
  db: D1Database,
  userId: string
): Promise<Array<{ provider: AuthProvider; email: string; createdAt: number }>> => {
  const results = await db
    .prepare(`SELECT provider, email, created_at FROM user_identities WHERE user_id = ?`)
    .bind(userId)
    .all<{ provider: AuthProvider; email: string; created_at: number }>()

  return results.results.map((r) => ({
    provider: r.provider,
    email: r.email,
    createdAt: r.created_at
  }))
}

/**
 * Delete a user and all associated data.
 *
 * @param db - D1 database
 * @param userId - User ID
 */
export const deleteUser = async (db: D1Database, userId: string): Promise<void> => {
  await db.batch([
    db.prepare(`DELETE FROM user_identities WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM refresh_tokens WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM devices WHERE user_id = ?`).bind(userId),
    db.prepare(`DELETE FROM users WHERE id = ?`).bind(userId)
  ])
}

export { userToPublic }
