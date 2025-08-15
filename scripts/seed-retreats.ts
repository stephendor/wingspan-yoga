import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleRetreats = [
  {
    title: 'Worcestershire Weekend Retreat',
    slug: 'worcestershire-weekend-retreat',
    description: `Join Anna for a transformative yoga weekend retreat at The Fold Organic Farm in the beautiful Worcestershire countryside.
    
Escape the hustle and bustle for a weekend of mindful movement, deep relaxation, and connection with nature. Set in a peaceful organic farm environment, this retreat offers the perfect opportunity to reset and recharge.

The weekend includes daily yoga sessions suitable for all levels, guided meditation, beautiful countryside walks, and delicious organic meals made with ingredients fresh from the farm. Accommodation ranges from cozy glamping options to comfortable farmhouse rooms.

This retreat is designed for anyone seeking to deepen their yoga practice, reduce stress, and enjoy the therapeutic benefits of time spent in nature. Whether you're a beginner or experienced practitioner, you'll find space to grow and unwind.

All yoga props provided. Please bring comfortable clothing suitable for outdoor activities and layers for changeable weather.`,
    location: 'The Fold Organic Farm, Worcestershire',
    startDate: new Date('2025-08-22'),
    endDate: new Date('2025-08-25'),
    totalPrice: 16800, // £168.00
    depositPrice: 10000, // £100.00
    capacity: 12,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', // Rolling green countryside
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', // Organic farm field
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', // Peaceful farmhouse
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
    totalPrice: 89900, // £899.00
    depositPrice: 29900, // £299.00
    capacity: 12,
    images: [
      'https://images.unsplash.com/photo-1464822759844-d150165c99fd?w=800', // Mountain landscape
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // Mountain meditation
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', // Mountain lodge/cabin
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
    totalPrice: 249900, // £2499.00
    depositPrice: 69900, // £699.00
    capacity: 20,
    images: [
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800', // Tuscany vineyard landscape
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800', // Italian villa
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', // Tuscany hills with cypress trees
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