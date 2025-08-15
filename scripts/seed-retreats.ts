import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleRetreats = [
  {
    title: 'Tropical Paradise Yoga Retreat',
    slug: 'tropical-paradise-yoga-retreat',
    description: `Escape to our stunning beachfront retreat in Costa Rica for 7 days of yoga, meditation, and pure bliss. 
    
Start each day with sunrise yoga on the beach, followed by nourishing breakfast made with fresh local ingredients. Explore the rainforest, practice mindfulness meditation, and enjoy daily yoga sessions designed for all levels.

Our experienced instructors will guide you through various styles including Vinyasa, Yin, and Restorative yoga. Includes accommodation in beautiful eco-lodges, all meals, airport transfers, and optional excursions to local waterfalls and wildlife reserves.

This retreat is perfect for beginners and experienced practitioners alike, offering time for deep personal reflection and connection with nature.`,
    location: 'Manuel Antonio, Costa Rica',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2024-12-22'),
    totalPrice: 189900, // $1899.00
    depositPrice: 59900, // $599.00
    capacity: 16,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800',
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800',
    ],
  },
  {
    title: 'Mountain Zen Meditation Retreat',
    slug: 'mountain-zen-meditation-retreat',
    description: `Find inner peace in the serene mountains of Colorado during this 5-day meditation and gentle yoga retreat.

Surrounded by breathtaking mountain views and fresh alpine air, you'll dive deep into meditation practices, mindful walking, and restorative yoga. This retreat is designed for those seeking mental clarity, stress relief, and spiritual rejuvenation.

Each day includes guided meditation sessions, gentle Hatha yoga, journaling time, and group discussions. Our cozy mountain lodge provides comfortable accommodation and organic vegetarian meals prepared with love.

Perfect for anyone looking to disconnect from daily stress and reconnect with their inner wisdom. All meditation and yoga levels welcome.`,
    location: 'Boulder, Colorado',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-01-25'),
    totalPrice: 129900, // $1299.00
    depositPrice: 39900, // $399.00
    capacity: 12,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    ],
  },
  {
    title: 'Tuscany Yoga & Wine Retreat',
    slug: 'tuscany-yoga-wine-retreat',
    description: `Indulge in the beauty of Tuscany while deepening your yoga practice in this luxurious 10-day retreat.

Located in a restored 15th-century villa surrounded by rolling hills and vineyards, this retreat combines daily yoga practice with wine tasting, cooking classes, and cultural excursions.

Morning Vinyasa flows in the olive grove, afternoon Yin sessions in the gardens, and evening meditation under the stars. Visit local wineries, learn to cook authentic Italian cuisine, and explore charming medieval towns.

Includes luxury accommodation, gourmet meals featuring local organic ingredients, wine tastings, cooking workshops, and cultural excursions. This adults-only retreat is perfect for those seeking a sophisticated blend of wellness and culture.`,
    location: 'Chianti, Tuscany, Italy',
    startDate: new Date('2025-05-10'),
    endDate: new Date('2025-05-20'),
    totalPrice: 349900, // $3499.00
    depositPrice: 99900, // $999.00
    capacity: 20,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800',
    ],
  },
]

async function seedRetreats() {
  console.log('🌱 Seeding retreat data...')

  try {
    // Clear existing retreats
    await prisma.retreatBooking.deleteMany()
    await prisma.retreat.deleteMany()

    // Create sample retreats
    for (const retreat of sampleRetreats) {
      const created = await prisma.retreat.create({
        data: retreat,
      })
      console.log(`✅ Created retreat: ${created.title}`)
    }

    console.log('🎉 Retreat seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding retreats:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedRetreats()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })