#!/usr/bin/env tsx
/**
 * Sync Contracts Script
 *
 * Copies shared contracts from src/shared/contracts to sync-server/src/contracts
 * and adds a header noting they are derived copies.
 *
 * Usage:
 *   pnpm sync-contracts        # Copy contracts
 *   pnpm sync-contracts --check # Check if contracts are in sync (CI mode)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, basename } from 'path'
import { createHash } from 'crypto'

const SOURCE_DIR = join(__dirname, '../src/shared/contracts')
const TARGET_DIR = join(__dirname, '../sync-server/src/contracts')

const CONTRACTS_TO_SYNC = [
  'auth-api.ts',
  'blob-api.ts',
  'cbor-ordering.ts',
  'linking-api.ts',
  'sync-api.ts'
]

const DERIVED_HEADER = `/**
 * AUTO-GENERATED - DO NOT EDIT DIRECTLY
 *
 * This file is automatically copied from src/shared/contracts/{filename}
 * Run \`pnpm sync-contracts\` to update.
 *
 * Changes should be made to the source file, not this copy.
 */

`

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16)
}

function getSourceContent(filename: string): string {
  const sourcePath = join(SOURCE_DIR, filename)
  if (!existsSync(sourcePath)) {
    throw new Error(`Source contract not found: ${sourcePath}`)
  }
  return readFileSync(sourcePath, 'utf-8')
}

function getTargetContent(filename: string): string | null {
  const targetPath = join(TARGET_DIR, filename)
  if (!existsSync(targetPath)) {
    return null
  }
  return readFileSync(targetPath, 'utf-8')
}

function stripDerivedHeader(content: string): string {
  const headerEnd = content.indexOf('*/\n\n')
  if (headerEnd !== -1 && content.startsWith('/**\n * AUTO-GENERATED')) {
    return content.slice(headerEnd + 4)
  }
  return content
}

function syncContract(filename: string, checkOnly: boolean): boolean {
  const sourceContent = getSourceContent(filename)
  const targetContent = getTargetContent(filename)

  const header = DERIVED_HEADER.replace('{filename}', filename)
  const expectedContent = header + sourceContent

  if (targetContent === null) {
    if (checkOnly) {
      console.error(`❌ ${filename}: Missing in sync-server`)
      return false
    }
    console.log(`📝 ${filename}: Creating...`)
    writeFileSync(join(TARGET_DIR, filename), expectedContent)
    return true
  }

  const strippedTarget = stripDerivedHeader(targetContent)
  const sourceHash = hashContent(sourceContent)
  const targetHash = hashContent(strippedTarget)

  if (sourceHash !== targetHash) {
    if (checkOnly) {
      console.error(`❌ ${filename}: Out of sync`)
      console.error(`   Source hash: ${sourceHash}`)
      console.error(`   Target hash: ${targetHash}`)
      return false
    }
    console.log(`🔄 ${filename}: Updating...`)
    writeFileSync(join(TARGET_DIR, filename), expectedContent)
    return true
  }

  console.log(`✅ ${filename}: In sync`)
  return true
}

function main(): void {
  const checkOnly = process.argv.includes('--check')

  if (!existsSync(TARGET_DIR)) {
    if (checkOnly) {
      console.error(`❌ Target directory does not exist: ${TARGET_DIR}`)
      process.exit(1)
    }
    mkdirSync(TARGET_DIR, { recursive: true })
  }

  console.log(checkOnly ? '🔍 Checking contracts...' : '📦 Syncing contracts...')
  console.log()

  let allGood = true
  for (const filename of CONTRACTS_TO_SYNC) {
    const result = syncContract(filename, checkOnly)
    if (!result) {
      allGood = false
    }
  }

  console.log()

  if (!allGood) {
    if (checkOnly) {
      console.error('❌ Contracts are out of sync. Run `pnpm sync-contracts` to fix.')
      process.exit(1)
    }
  } else {
    console.log('✅ All contracts are in sync.')
  }
}

main()
