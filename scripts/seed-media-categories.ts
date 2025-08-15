import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultMediaCategories = [
  // Root categories
  {
    name: 'Private',
    slug: 'private',
    description: 'Private internal media files',
    parentId: null,
    sortOrder: 10,
  },
  {
    name: 'Memberships',
    slug: 'memberships',
    description: 'Media for membership content and marketing',
    parentId: null,
    sortOrder: 20,
  },
  {
    name: 'Retreats',
    slug: 'retreats',
    description: 'Media related to yoga retreats',
    parentId: null,
    sortOrder: 30,
  },
  {
    name: 'Workshops',
    slug: 'workshops',
    description: 'Media for workshops and special events',
    parentId: null,
    sortOrder: 40,
  },
  {
    name: 'General',
    slug: 'general',
    description: 'General purpose media files',
    parentId: null,
    sortOrder: 50,
  },
];

// Subcategories will be added after parent categories are created
const subcategories = [
  // Membership subcategories
  {
    name: 'Basic Membership',
    slug: 'basic-membership',
    description: 'Media for basic membership tier',
    parentSlug: 'memberships',
    sortOrder: 10,
  },
  {
    name: 'Premium Membership',
    slug: 'premium-membership',
    description: 'Media for premium membership tier',
    parentSlug: 'memberships',
    sortOrder: 20,
  },
  {
    name: 'Family Membership',
    slug: 'family-membership',
    description: 'Media for family membership tier',
    parentSlug: 'memberships',
    sortOrder: 30,
  },
  
  // Retreat subcategories
  {
    name: 'Tuscany Retreat',
    slug: 'tuscany-retreat',
    description: 'Media for Tuscany yoga retreat',
    parentSlug: 'retreats',
    sortOrder: 10,
  },
  {
    name: 'Bali Retreat',
    slug: 'bali-retreat',
    description: 'Media for Bali yoga retreat',
    parentSlug: 'retreats',
    sortOrder: 20,
  },
  {
    name: 'Local Retreats',
    slug: 'local-retreats',
    description: 'Media for local day retreats',
    parentSlug: 'retreats',
    sortOrder: 30,
  },
  
  // Workshop subcategories
  {
    name: 'Beginner Workshops',
    slug: 'beginner-workshops',
    description: 'Media for beginner-level workshops',
    parentSlug: 'workshops',
    sortOrder: 10,
  },
  {
    name: 'Advanced Workshops',
    slug: 'advanced-workshops',
    description: 'Media for advanced-level workshops',
    parentSlug: 'workshops',
    sortOrder: 20,
  },
  {
    name: 'Teacher Training',
    slug: 'teacher-training',
    description: 'Media for teacher training workshops',
    parentSlug: 'workshops',
    sortOrder: 30,
  },
  
  // General subcategories
  {
    name: 'Blog Images',
    slug: 'blog-images',
    description: 'Images for blog posts',
    parentSlug: 'general',
    sortOrder: 10,
  },
  {
    name: 'Social Media',
    slug: 'social-media',
    description: 'Media for social media posts',
    parentSlug: 'general',
    sortOrder: 20,
  },
  {
    name: 'Website Assets',
    slug: 'website-assets',
    description: 'General website images and media',
    parentSlug: 'general',
    sortOrder: 30,
  },
];

async function seedMediaCategories() {
  console.log('🌱 Seeding media categories...');
  
  try {
    // Create parent categories first
    console.log('Creating parent categories...');
    const createdCategories = new Map<string, string>();
    
    for (const category of defaultMediaCategories) {
      const created = await prisma.mediaCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
        },
        create: category,
      });
      
      createdCategories.set(category.slug, created.id);
      console.log(`✅ Created category: ${category.name}`);
    }
    
    // Create subcategories
    console.log('Creating subcategories...');
    for (const subcategory of subcategories) {
      const parentId = createdCategories.get(subcategory.parentSlug);
      if (!parentId) {
        console.warn(`⚠️ Parent category not found for: ${subcategory.name}`);
        continue;
      }
      
      await prisma.mediaCategory.upsert({
        where: { slug: subcategory.slug },
        update: {
          name: subcategory.name,
          description: subcategory.description,
          parentId,
          sortOrder: subcategory.sortOrder,
        },
        create: {
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          parentId,
          sortOrder: subcategory.sortOrder,
        },
      });
      
      console.log(`✅ Created subcategory: ${subcategory.name}`);
    }
    
    console.log('🎉 Media categories seeded successfully!');
    
    // Display the hierarchy
    console.log('\n📋 Category Hierarchy:');
    const categories = await prisma.mediaCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    
    categories.forEach(category => {
      console.log(`📁 ${category.name}`);
      category.children.forEach(child => {
        console.log(`  └── ${child.name}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error seeding media categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedMediaCategories().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default seedMediaCategories;
