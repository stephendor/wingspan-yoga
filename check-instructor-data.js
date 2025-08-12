/**
 * Test database structure for instructor schedule data
 * This script checks the relationship between Users with INSTRUCTOR role and Classes
 */

const { PrismaClient } = require('@prisma/client');

async function checkInstructorData() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking instructor data structure...\n');

    // 1. Check users with INSTRUCTOR role
    const instructors = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('👨‍🏫 Users with INSTRUCTOR role:');
    instructors.forEach(instructor => {
      console.log(`  - ${instructor.name} (${instructor.email}) ID: ${instructor.id}`);
    });
    console.log();

    // 2. Check if there are Classes table records
    const classCount = await prisma.class.count();
    console.log(`📚 Total classes in database: ${classCount}`);

    // 3. Check ClassTemplate records
    const templateCount = await prisma.classTemplate.count();
    console.log(`📋 Total class templates: ${templateCount}`);

    // 4. Check ClassInstance records
    const instanceCount = await prisma.classInstance.count();
    console.log(`📅 Total class instances: ${instanceCount}`);

    // 5. Check Bookings
    const bookingCount = await prisma.booking.count();
    console.log(`🎫 Total bookings: ${bookingCount}\n`);

    // 6. If we have instructors and classes, show the relationship
    if (instructors.length > 0 && classCount > 0) {
      console.log('🔗 Class assignments by instructor:');
      
      for (const instructor of instructors) {
        const classes = await prisma.class.findMany({
          where: { instructorId: instructor.id },
          include: {
            bookings: {
              include: {
                user: {
                  select: { id: true, name: true, email: true }
                }
              }
            }
          }
        });

        console.log(`\n📖 ${instructor.name} (${instructor.email}):`);
        if (classes.length === 0) {
          console.log('  No classes assigned');
        } else {
          classes.forEach(cls => {
            console.log(`  - ${cls.title} on ${cls.startTime.toISOString()}`);
            console.log(`    Capacity: ${cls.capacity}, Bookings: ${cls.bookings.length}`);
            cls.bookings.forEach(booking => {
              console.log(`      👤 ${booking.user.name} (${booking.status})`);
            });
          });
        }
      }
    }

    // 7. Check if there's a separate Instructor table
    const separateInstructors = await prisma.instructor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      }
    });

    if (separateInstructors.length > 0) {
      console.log('\n👨‍🏫 Separate Instructor records:');
      separateInstructors.forEach(instr => {
        console.log(`  - ${instr.name} (${instr.email}) Active: ${instr.isActive}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstructorData().catch(console.error);
