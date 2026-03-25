import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = process.env.ADMIN_SEED_PASSWORD
  if (!password) {
    throw new Error(
      'ADMIN_SEED_PASSWORD environment variable is required.\nUsage: ADMIN_SEED_PASSWORD=yourpassword npm run seed:admin'
    )
  }

  const hash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@accessiscan.com' },
    update: {
      plan: 'ENTERPRISE',
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@accessiscan.com',
      name: 'AccessiScan Admin',
      passwordHash: hash,
      plan: 'ENTERPRISE',
      role: 'SUPER_ADMIN',
    },
  })

  console.log(`✓ Super admin ready: ${admin.email} (plan: ${admin.plan}, role: ${admin.role})`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
