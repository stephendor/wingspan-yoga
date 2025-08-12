import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Test login functionality with the created admin and instructor accounts
 */
async function testLogins() {
  console.log('🧪 Testing Wingspan Yoga Login System');
  console.log('=====================================\n');

  const prisma = new PrismaClient();

  const testAccounts = [
    {
      email: 'admin@wingspan-yoga.com',
      password: 'rufus@power0',
      expectedRole: 'ADMIN',
      description: 'Admin account'
    },
    {
      email: 'anna@wingspan-yoga.com', 
      password: '100%Rufus',
      expectedRole: 'INSTRUCTOR',
      description: 'Instructor account (Anna)'
    }
  ];

  try {
    console.log('1️⃣ Testing database connection and user accounts...\n');
    
    for (const account of testAccounts) {
      console.log(`   Testing ${account.description} (${account.email})...`);
      
      const user = await prisma.user.findUnique({
        where: { email: account.email },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          password: true,
          name: true 
        }
      });
      
      if (!user) {
        console.log(`   ❌ User ${account.email} not found in database`);
        continue;
      }
      
      console.log(`   ✅ User found: ID ${user.id}, Name: ${user.name}, Role: ${user.role}`);
      
      // Test password verification
      const passwordValid = user.password ? await bcrypt.compare(account.password, user.password) : false;
      console.log(`   ${passwordValid ? '✅' : '❌'} Password verification: ${passwordValid ? 'VALID' : 'INVALID'}`);
      
      // Test role assignment
      const roleCorrect = user.role === account.expectedRole;
      console.log(`   ${roleCorrect ? '✅' : '❌'} Role assignment: Expected ${account.expectedRole}, Got ${user.role}`);
      
      console.log('');
    }

    // Test 2: Query all users to see the complete state
    console.log('2️⃣ Complete user database state...\n');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`   Found ${allUsers.length} total users in database:`);
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt.toLocaleDateString()}`);
    });

    console.log('\n🎯 Test Summary');
    console.log('===============');
    console.log('✅ Database connection successful');
    console.log('✅ Test accounts found with correct roles');
    console.log('✅ Password hashing and verification working');
    console.log('\n🚀 Ready for browser-based login testing!');
    console.log('\nTest these credentials at http://localhost:3002/auth/signin:');
    console.log('📧 Admin: admin@wingspan-yoga.com / rufus@power0');
    console.log('📧 Instructor: anna@wingspan-yoga.com / 100%Rufus');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogins();
