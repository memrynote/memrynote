import Store from 'electron-store'

/**
 * Vault information stored in electron-store
 */
export interface StoredVaultInfo {
  path: string
  name: string
  noteCount: number
  taskCount: number
  lastOpened: string
  isDefault: boolean
}

/**
 * Application store schema
 */
interface StoreSchema {
  /** Path to the currently open vault */
  currentVault: string | null
  /** List of known vaults */
  vaults: StoredVaultInfo[]
}

/**
 * Persistent store for application settings.
 * Data is stored in the OS-specific app data directory.
 */
export const store = new Store<StoreSchema>({
  name: 'memry-config',
  defaults: {
    currentVault: null,
    vaults: []
  }
})

/**
 * Get the current vault path
 */
export function getCurrentVaultPath(): string | null {
  return store.get('currentVault')
}

/**
 * Set the current vault path
 */
export function setCurrentVaultPath(path: string | null): void {
  store.set('currentVault', path)
}

/**
 * Get all known vaults
 */
export function getVaults(): StoredVaultInfo[] {
  return store.get('vaults')
}

/**
 * Add or update a vault in the known vaults list
 */
export function upsertVault(vault: StoredVaultInfo): void {
  const vaults = store.get('vaults')
  const existingIndex = vaults.findIndex((v) => v.path === vault.path)

  if (existingIndex >= 0) {
    vaults[existingIndex] = vault
  } else {
    vaults.push(vault)
  }

  store.set('vaults', vaults)
}

/**
 * Remove a vault from the known vaults list
 */
export function removeVault(path: string): void {
  const vaults = store.get('vaults')
  store.set(
    'vaults',
    vaults.filter((v) => v.path !== path)
  )
}

/**
 * Find a vault by path
 */
export function findVault(path: string): StoredVaultInfo | undefined {
  return store.get('vaults').find((v) => v.path === path)
}

/**
 * Update the lastOpened timestamp for a vault
 */
export function touchVault(path: string): void {
  const vault = findVault(path)
  if (vault) {
    upsertVault({
      ...vault,
      lastOpened: new Date().toISOString()
    })
  }
}
