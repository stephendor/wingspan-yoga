const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        membershipType: true,
        password: true,
      }
    });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('MembershipType:', user.membershipType);
      console.log('Password hash exists:', !!user.password);
      console.log('Password hash starts with:', user.password ? user.password.substring(0, 10) : 'N/A');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
