import type { Config } from 'drizzle-kit'

export default {
  schema: './src/shared/db/schema/index.ts',
  out: './src/main/database/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './test.db'
  }
} satisfies Config
