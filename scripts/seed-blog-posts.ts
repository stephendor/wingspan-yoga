import { prisma } from '../src/lib/prisma';
import { BlogPostAccessLevel } from '@prisma/client';

async function createSampleBlogPosts() {
  try {
    // Check if blog posts already exist
    const existingPosts = await prisma.blogPost.count();
    
    if (existingPosts > 0) {
      console.log(`Found ${existingPosts} existing blog posts. Skipping sample creation.`);
      return;
    }

    console.log('Creating sample blog posts from Website Design Brief...');

    // Create sample blog posts based on the Website Design Brief content
    const samplePosts = [
      {
        title: "The Yoga Mat as a Training Ground for Life",
        slug: "yoga-mat-training-ground-for-life",
        excerpt: "I often consider time spent on the yoga mat to be a kind of 'training ground' for life. What do I mean by this?",
        authorName: "Anna Dorman",
        contentBlocks: {
          blocks: [
            {
              type: "paragraph",
              content: "I often consider time spent on the yoga mat to be a kind of 'training ground' for life. What do I mean by this? Let's say that during a simple movement exploration (coming in and out of a seated twist for example, or moving between dog pose and plank a few times) we ask ourselves, 'How does this feel? Does my body want to go slower with this movement? Or does it need to speed up? Where exactly do I need to stop in order to respect any given part of the body and work safely, whilst perhaps also bringing in a satisfying level of challenge..?'"
            },
            {
              type: "paragraph", 
              content: "This process of paying close attention to our responses and impulses moment by moment can give us useful information about our lives off the mat. Perhaps you notice that there's a part of yourself that is never satisfied, always striving for more, or you notice that there's a conflict between your felt sense and a habitual thought pattern telling you something like: 'I must fit in and do what everyone else is doing.' This witnessing of ourselves and our patterns of thought is something that can lead us into deeper practice."
            },
            {
              type: "paragraph",
              content: "Self study, or Svadhyaya, is one of the Niyamas (inner observances) from the ancient yogic texts. And the yoga mat offers a kind of laboratory for our study, should we wish to embark on the journey of self-discovery."
            },
            {
              type: "paragraph",
              content: "This increase in levels of self awareness and therefore choice in all areas of life is one of the most profound and life changing benefits of a yoga practice."
            }
          ]
        },
        metaDescription: "Discover how your yoga practice can serve as a training ground for life, building self-awareness and choice in every moment.",
        category: "Philosophy",
        published: true,
        accessLevel: BlogPostAccessLevel.PUBLIC,
        tags: ["philosophy", "mindfulness", "self-study", "svadhyaya"],
        publishedAt: new Date('2023-11-23')
      },
      {
        title: "Finding Inspiration in Trees: Root Systems and Stability",
        slug: "inspiration-trees-root-systems-stability",
        excerpt: "I love to bring images of trees to mind during my yoga practice, finding inspiration in root systems and ancient wisdom.",
        authorName: "Anna Dorman",
        contentBlocks: {
          blocks: [
            {
              type: "paragraph",
              content: "This picture above was painted recently by my Dad, who took up painting later in life, attending classes at The Studio Art School run by my cousin Justin, down on the south coast in Dorset. On seeing this one I was immediately struck by the similarity with the famous 'lone tree' of Llyn Padarn, near where I live, 300 miles away."
            },
            {
              type: "paragraph",
              content: "What an incredible location for this tree to survive in. Up here in North Wales I recently visited another famous tree. This ancient yew tree has been estimated to be a mind-boggling 4000 years old!! You just can't help but feel a sense of reverence and awe in the presence of this ancient yew. It sits in a church yard now, but of course it predates Christianity by about half of its lifetime!"
            },
            {
              type: "paragraph",
              content: "On the same day we also came across this pair of trees with their beautifully entwined root systems, exposed for us to appreciate a little of what is going on underground! I love to bring images of trees to mind during my yoga practice, finding inspiration in root systems such as these."
            },
            {
              type: "paragraph",
              content: "What if our feet could grow roots just like the ones above? The more we can gain an embodied sense of growing our roots downwards, the more we gain stability in the body and perhaps more steadiness of mind at the same time."
            },
            {
              type: "quote",
              content: "The pull of gravity under our feet makes it possible for us to extend the upper part of the spine, and this extension allows us to release tension between the vertebrae. Gravity is like a magnet attracting us to the earth, but this attraction is not limited to pulling us down, it also allows us to stretch in the opposite direction towards the sky.",
              attribution: "Vanda Scaravelli, Awakening The Spine, 1991"
            },
            {
              type: "paragraph",
              content: "So, through dedicated practice, we find ourselves standing tall and perhaps also carrying ourselves with greater confidence and ease. A kind of confidence that has nothing to do with ego and everything to do with simply claiming one's place alongside all other living things, with a sense of equanimity, inspired by the trees."
            }
          ]
        },
        metaDescription: "Explore how trees and their root systems can inspire your yoga practice, bringing stability, grounding, and confidence.",
        category: "Practice",
        published: true,
        accessLevel: BlogPostAccessLevel.PUBLIC, 
        tags: ["nature", "grounding", "stability", "vanda-scaravelli", "practice"],
        publishedAt: new Date('2023-10-15')
      },
      {
        title: "The Legacy of Vanda Scaravelli",
        slug: "vanda-scaravelli-legacy-natural-wisdom",
        excerpt: "I often wonder what it would have been like to meet and work with Vanda personally. Her approach informed my teacher training and practice to this day.",
        authorName: "Anna Dorman",
        contentBlocks: {
          blocks: [
            {
              type: "paragraph",
              content: "I often wonder what it would have been like to meet and work with Vanda personally. Her approach informed my teacher training and and my practice and teaching style to this day. What characterises this practice?"
            },
            {
              type: "paragraph",
              content: "Vanda believed in the natural wisdom of the body and in the unraveling release that we can find through careful practice. Three practice 'friends' - Gravity, The Spine & The Breath, make everything possible."
            },
            {
              type: "paragraph",
              content: "The lower half of the body learns to root down into the ground and to be become anchored and strong. The upper half of the body meanwhile becomes more fluid and free."
            }
          ]
        },
        metaDescription: "Learn about Vanda Scaravelli's revolutionary approach to yoga that emphasizes the natural wisdom of the body.",
        category: "Teaching",
        published: true,
        accessLevel: BlogPostAccessLevel.PUBLIC,
        tags: ["vanda-scaravelli", "teaching", "philosophy", "gravity", "spine", "breath"],
        publishedAt: new Date('2023-09-20')
      }
    ];

    // Create the blog posts
    for (const post of samplePosts) {
      const createdPost = await prisma.blogPost.create({
        data: {
          ...post,
          createdAt: post.publishedAt,
          updatedAt: post.publishedAt
        }
      });
      console.log(`Created blog post: ${createdPost.title}`);
    }

    console.log('Sample blog posts created successfully!');
  } catch (error) {
    console.error('Error creating sample blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleBlogPosts();
