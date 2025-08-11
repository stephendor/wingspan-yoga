import { assertStripePricesExist } from '../src/lib/stripe/plans'

async function main() {
  console.log('Verifying Stripe price IDs for configured plans...')
  await assertStripePricesExist()
  console.log('All Stripe prices verified.')
}

main().catch(err => {
  console.error('Stripe price verification failed:', err.message)
  process.exit(1)
})
