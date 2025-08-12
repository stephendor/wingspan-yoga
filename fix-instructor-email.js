/**
 * Fix instructor email consistency
 * Update the Instructor record to use the same email as the User record
 */

const { PrismaClient } = require('@prisma/client');

async function fixInstructorEmail() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Fixing instructor email consistency...\n');

    // First, check current state
    console.log('📊 Current state:');
    const currentInstructor = await prisma.instructor.findFirst();
    const currentUser = await prisma.user.findFirst({
      where: { role: 'INSTRUCTOR' }
    });

    console.log('Instructor record email:', currentInstructor?.email);
    console.log('User record email:', currentUser?.email);

    // Update the instructor email to match the user email
    if (currentInstructor && currentUser) {
      const updatedInstructor = await prisma.instructor.update({
        where: { id: currentInstructor.id },
        data: { email: currentUser.email }
      });

      console.log('\n✅ Updated instructor email to:', updatedInstructor.email);

      // Verify the fix
      const classes = await prisma.class.findMany({
        where: { instructorId: currentInstructor.id },
        include: {
          instructor: true,
          bookings: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      console.log(`\n📚 Classes assigned to instructor: ${classes.length}`);
      classes.forEach(cls => {
        console.log(`- ${cls.title} (${cls.date}) - ${cls.bookings.length} bookings`);
      });

    } else {
      console.log('❌ Could not find instructor or user records');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInstructorEmail();
