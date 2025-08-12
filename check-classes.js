/**
 * Check all classes and their instructor assignments
 */

const { PrismaClient } = require('@prisma/client');

async function checkClassData() {
  const prisma = new PrismaClient();

  try {
    console.log('📚 Checking all classes and assignments...\n');

    const classes = await prisma.class.findMany({
      include: {
        instructor: true,
        bookings: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    console.log(`Found ${classes.length} classes:`);
    
    classes.forEach((cls, index) => {
      console.log(`\n${index + 1}. ${cls.title}`);
      console.log(`   📅 ${cls.startTime.toLocaleDateString()} ${cls.startTime.toLocaleTimeString()}`);
      console.log(`   🏠 ${cls.location} | 💰 £${(cls.price / 100).toFixed(2)} | 👥 ${cls.capacity} capacity`);
      console.log(`   👨‍🏫 Instructor: ${cls.instructor?.name || 'Not assigned'} (${cls.instructor?.email || 'N/A'})`);
      console.log(`   📊 Status: ${cls.status} | 🎫 Bookings: ${cls.bookings.length}`);
      
      if (cls.bookings.length > 0) {
        console.log('   👤 Students:');
        cls.bookings.forEach(booking => {
          console.log(`      - ${booking.user.name} (${booking.status})`);
        });
      }
    });

    // Check separate Instructor records
    console.log('\n\n👨‍🏫 Separate Instructor records:');
    const instructors = await prisma.instructor.findMany({
      include: {
        classes: {
          select: { id: true, title: true, startTime: true }
        }
      }
    });

    instructors.forEach(instr => {
      console.log(`\n${instr.name} (${instr.email})`);
      console.log(`  Active: ${instr.isActive}`);
      console.log(`  Classes assigned: ${instr.classes.length}`);
      instr.classes.forEach(cls => {
        console.log(`    - ${cls.title} on ${cls.startTime.toLocaleDateString()}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkClassData().catch(console.error);
