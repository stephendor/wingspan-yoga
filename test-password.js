const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        password: true,
      }
    });
    
    if (user && user.password) {
      const isValid = await bcrypt.compare('password123', user.password);
      console.log('Password verification result:', isValid);
    } else {
      console.log('User or password not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
