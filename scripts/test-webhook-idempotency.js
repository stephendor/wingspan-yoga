/* Temporary script to validate WebhookEvent PK idempotency */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const id = 'evt_manual_seq_prisma';
  try {
    console.log('First create (expect success)');
    await p.webhookEvent.create({ data: { id, type: 'test.type' } });
    console.log('First OK');
  } catch (e) {
    console.error('First insert failed unexpectedly:', e.code || e.message);
    process.exit(1);
  }
  try {
    console.log('Second create (expect duplicate error)');
    await p.webhookEvent.create({ data: { id, type: 'test.type' } });
    console.log('[UNEXPECTED] Second insert succeeded; uniqueness not enforced');
    process.exit(2);
  } catch (e) {
    if (e.code === 'P2002') {
      console.log('[EXPECTED] Duplicate prevented (P2002 unique constraint)');
    } else {
      console.error('Second insert failed with unexpected error code:', e.code, e.message);
      process.exit(3);
    }
  } finally {
    await p.$disconnect();
  }
})();
