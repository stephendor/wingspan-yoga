import { PrismaClient } from '@prisma/client'
import { PLAN_DEFINITIONS } from '../src/lib/stripe/plans'

const prisma = new PrismaClient()

async function main() {
  console.log('Syncing subscription plans...')
  for (const def of PLAN_DEFINITIONS) {
    await prisma.subscriptionPlan.upsert({
      where: { stripePriceId: def.stripePriceId },
      create: {
        stripePriceId: def.stripePriceId,
        interval: def.interval,
        amount: def.amount,
        currency: def.currency,
        name: def.name,
        description: def.description,
        active: def.active,
      },
      update: {
        interval: def.interval,
        amount: def.amount,
        currency: def.currency,
        name: def.name,
        description: def.description,
        active: def.active,
      },
    })
  }
  const count = await prisma.subscriptionPlan.count()
  console.log(`Plan sync complete. Total plans in DB: ${count}`)
}

main()
  .catch(err => {
    console.error('Plan sync failed:', err)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())
