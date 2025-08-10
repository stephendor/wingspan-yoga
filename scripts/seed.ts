import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (be careful in production)
  await prisma.videoProgress.deleteMany()
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.video.deleteMany()
  await prisma.class.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create instructors
  const instructor1 = await prisma.instructor.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@wingspanyoga.com',
      bio: 'Sarah is a certified 500-hour yoga instructor with over 8 years of experience. She specializes in Vinyasa flow and mindfulness meditation.',
      specialties: ['Vinyasa', 'Meditation', 'Breathwork'],
      yearsExp: 8,
      certification: 'RYT 500',
      isActive: true,
    },
  })

  const instructor2 = await prisma.instructor.create({
    data: {
      name: 'Michael Chen',
      email: 'michael@wingspanyoga.com',
      bio: 'Michael brings a gentle approach to yoga with focus on restorative and yin practices. Perfect for beginners and those seeking relaxation.',
      specialties: ['Yin', 'Restorative', 'Gentle'],
      yearsExp: 5,
      certification: 'RYT 200',
      isActive: true,
    },
  })

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      membershipType: 'PREMIUM',
      membershipStatus: 'ACTIVE',
      bio: 'Yoga enthusiast exploring mindfulness and flexibility.',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'beginner@example.com',
      name: 'Jane Beginner',
      password: hashedPassword,
      membershipType: 'BASIC',
      membershipStatus: 'ACTIVE',
      bio: 'New to yoga and excited to learn!',
    },
  })

  // Create sample videos
  const video1 = await prisma.video.create({
    data: {
      title: 'Morning Vinyasa Flow - 30 Minutes',
      description: 'Energizing morning practice to start your day with intention and movement.',
      duration: 1800, // 30 minutes in seconds
      videoUrl: 'https://example.com/video1.mp4',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      category: 'VINYASA',
      difficulty: 'INTERMEDIATE',
      tags: ['morning', 'energizing', 'flow'],
      isPublic: true,
      membershipRequired: 'FREE',
      instructorId: instructor1.id,
    },
  })

  const video2 = await prisma.video.create({
    data: {
      title: 'Gentle Yin Yoga - 45 Minutes',
      description: 'Deep relaxation and stretch practice perfect for evening wind-down.',
      duration: 2700, // 45 minutes
      videoUrl: 'https://example.com/video2.mp4',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      category: 'YIN',
      difficulty: 'BEGINNER',
      tags: ['evening', 'relaxation', 'stretch'],
      isPublic: true,
      membershipRequired: 'BASIC',
      instructorId: instructor2.id,
    },
  })

  // Create sample classes
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0) // 9 AM tomorrow

  const class1 = await prisma.class.create({
    data: {
      title: 'Power Vinyasa Flow',
      description: 'Dynamic 60-minute class building strength and flexibility',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // +1 hour
      capacity: 20,
      price: 2500, // $25.00
      difficulty: 'INTERMEDIATE',
      category: 'VINYASA',
      location: 'STUDIO',
      instructorId: instructor1.id,
    },
  })

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(18, 30, 0, 0) // 6:30 PM next week

  await prisma.class.create({
    data: {
      title: 'Restorative Yoga Online',
      description: 'Gentle online practice focusing on deep relaxation',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 75 * 60 * 1000), // +75 minutes
      capacity: 50,
      price: 1800, // $18.00
      difficulty: 'BEGINNER',
      category: 'RESTORATIVE',
      location: 'ONLINE',
      meetingUrl: 'https://zoom.us/j/123456789',
      instructorId: instructor2.id,
    },
  })

  // Create sample bookings
  await prisma.booking.create({
    data: {
      userId: user1.id,
      classId: class1.id,
      status: 'CONFIRMED',
    },
  })

  // Create sample video progress
  await prisma.videoProgress.create({
    data: {
      userId: user1.id,
      videoId: video1.id,
      progress: 75.5,
      completed: false,
    },
  })

  await prisma.videoProgress.create({
    data: {
      userId: user2.id,
      videoId: video2.id,
      progress: 100,
      completed: true,
    },
  })

  // Create sample reviews
  await prisma.review.create({
    data: {
      userId: user1.id,
      videoId: video1.id,
      rating: 5,
      title: 'Perfect morning routine!',
      content: 'This video has become my go-to morning practice. Sarah\'s instruction is clear and the flow is perfectly paced.',
    },
  })

  // Create sample blog posts
  await prisma.blogPost.create({
    data: {
      title: 'Getting Started with Yoga: A Beginner\'s Guide',
      slug: 'getting-started-yoga-beginners-guide',
      excerpt: 'New to yoga? This comprehensive guide will help you start your journey with confidence.',
      content: `# Getting Started with Yoga
      
      Yoga is an ancient practice that combines physical postures, breathing techniques, and meditation. Whether you're looking to improve flexibility, reduce stress, or build strength, yoga offers something for everyone.
      
      ## What to Expect in Your First Class
      
      - Comfortable clothing that allows movement
      - A yoga mat (usually provided at studios)
      - An open mind and willingness to try
      
      ## Basic Poses for Beginners
      
      1. **Mountain Pose (Tadasana)** - The foundation of all standing poses
      2. **Downward Dog (Adho Mukha Svanasana)** - A full-body stretch and strengthener
      3. **Child's Pose (Balasana)** - A restful pose for when you need a break
      
      Remember, yoga is a personal practice. Listen to your body and never force a pose.`,
      published: true,
      publishedAt: new Date(),
      featured: true,
      tags: ['beginner', 'getting-started', 'basics'],
      authorName: 'Sarah Johnson',
      authorAvatar: 'https://example.com/sarah-avatar.jpg',
    },
  })

  // Create site settings
  await prisma.siteSettings.create({
    data: {
      key: 'STUDIO_ADDRESS',
      value: {
        street: '123 Wellness Way',
        city: 'Mindful City',
        state: 'CA',
        zip: '90210',
        country: 'USA'
      },
      description: 'Physical studio address',
    },
  })

  await prisma.siteSettings.create({
    data: {
      key: 'CONTACT_INFO',
      value: {
        phone: '(555) 123-YOGA',
        email: 'hello@wingspanyoga.com',
        hours: {
          monday: '6:00 AM - 9:00 PM',
          tuesday: '6:00 AM - 9:00 PM',
          wednesday: '6:00 AM - 9:00 PM',
          thursday: '6:00 AM - 9:00 PM',
          friday: '6:00 AM - 8:00 PM',
          saturday: '7:00 AM - 6:00 PM',
          sunday: '8:00 AM - 5:00 PM'
        }
      },
      description: 'Studio contact information and hours',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`
📊 Created:
- 2 instructors
- 2 users
- 2 videos
- 2 classes
- 1 booking
- 2 video progress records
- 1 review
- 1 blog post
- 2 site settings
`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
