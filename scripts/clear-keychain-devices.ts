import keytar from 'keytar'

const DEFAULT_SERVICES = ['com.memry.app.deviceA', 'com.memry.app.deviceB']
const ACCOUNTS = ['master-keys', 'device-keys', 'signing-keys', 'auth-tokens'] as const

function printUsage(): void {
  console.log('Usage: npx tsx scripts/clear-keychain-devices.ts [serviceName ...]')
  console.log('If no service names are provided, clears deviceA and deviceB services.')
}

const args = process.argv.slice(2).map((arg) => arg.trim()).filter(Boolean)
if (args.includes('--help') || args.includes('-h')) {
  printUsage()
  process.exit(0)
}

const services = args.length > 0 ? args : DEFAULT_SERVICES

async function clearService(service: string): Promise<void> {
  const results = await Promise.all(
    ACCOUNTS.map(async (account) => ({
      account,
      deleted: await keytar.deletePassword(service, account)
    }))
  )

  const deletedAccounts = results.filter((result) => result.deleted).map((result) => result.account)
  const missingAccounts = results.filter((result) => !result.deleted).map((result) => result.account)

  console.log(`[Keychain] ${service}`)
  if (deletedAccounts.length > 0) {
    console.log(`  Deleted: ${deletedAccounts.join(', ')}`)
  }
  if (missingAccounts.length > 0) {
    console.log(`  Not found: ${missingAccounts.join(', ')}`)
  }
}

async function main(): Promise<void> {
  for (const service of services) {
    await clearService(service)
  }
}

main().catch((error) => {
  console.error('[Keychain] Failed to clear services:', error)
  process.exitCode = 1
})
