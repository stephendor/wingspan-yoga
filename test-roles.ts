import { PrismaClient } from '@prisma/client';

async function testRoles() {
  console.log('🧪 Testing Role Field');
  console.log('=====================\n');

  const prisma = new PrismaClient();

  try {
    // Try to query roles using raw SQL to see if the field exists
    const result = await prisma.$queryRaw`
      SELECT email, name, role 
      FROM users 
      WHERE email IN ('admin@wingspan-yoga.com', 'anna@wingspan-yoga.com')
    `;
    
    console.log('✅ Role field exists in database:');
    console.log(result);
    
  } catch (error) {
    console.log('❌ Role field might not exist in database');
    console.log('Error:', error);
    
    // Try without role field
    try {
      const fallbackResult = await prisma.$queryRaw`
        SELECT email, name 
        FROM users 
        WHERE email IN ('admin@wingspan-yoga.com', 'anna@wingspan-yoga.com')
      `;
      console.log('✅ Users exist without role field:');
      console.log(fallbackResult);
    } catch (fallbackError) {
      console.log('❌ Database connection issue:', fallbackError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testRoles();
