import { defineConfig } from '@prisma/config'
import path from 'node:path'

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: `file:${path.join('prisma', 'dev.db')}`,
  },
})
