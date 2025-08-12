import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Simple test to verify our test accounts exist and passwords work
 */
async function testBasicLogin() {
  console.log('🧪 Basic Login Test');
  console.log('==================\n');

  const prisma = new PrismaClient();

  const testAccounts = [
    { email: 'admin@wingspan-yoga.com', password: 'rufus@power0', description: 'Admin' },
    { email: 'anna@wingspan-yoga.com', password: '100%Rufus', description: 'Instructor' }
  ];

  try {
    for (const account of testAccounts) {
      console.log(`Testing ${account.description}: ${account.email}`);
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: account.email },
        select: { 
          id: true, 
          email: true, 
          name: true,
          password: true
        }
      });
      
      if (!user) {
        console.log(`   ❌ User not found`);
        continue;
      }
      
      console.log(`   ✅ User found: ${user.name} (ID: ${user.id})`);
      
      // Test password
      if (user.password) {
        const passwordValid = await bcrypt.compare(account.password, user.password);
        console.log(`   ${passwordValid ? '✅' : '❌'} Password: ${passwordValid ? 'VALID' : 'INVALID'}`);
      } else {
        console.log(`   ❌ No password stored for user`);
      }
      console.log('');
    }

    // Show all users in database
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true }
    });
    
    console.log(`📊 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBasicLogin();
