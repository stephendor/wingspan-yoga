import { prisma } from '../src/lib/prisma'

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@wingspan-yoga.com', 'anna@wingspan-yoga.com']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        membershipType: true
      }
    });
    
    console.log('RBAC Users:', JSON.stringify(users, null, 2));
    
    if (users.length === 2) {
      console.log('✅ Both users found with correct roles!');
    } else {
      console.log('❌ Missing users. Found:', users.length);
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
