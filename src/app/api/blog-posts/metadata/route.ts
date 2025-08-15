import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BlogMetadataResponse {
  success: boolean;
  metadata?: {
    tags: Array<{ tag: string; count: number }>;
    categories: Array<{ category: string; count: number }>;
    totalPosts: number;
    publishedPosts: number;
    archives: Array<{
      year: number;
      month: number;
      count: number;
      monthName: string;
    }>;
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<BlogMetadataResponse>> {
  try {
    // Get all published blog posts for metadata
    const publishedPosts = await prisma.blogPost.findMany({
      where: { 
        published: true,
        accessLevel: 'PUBLIC', // Only count public posts for general metadata
      },
      select: {
        tags: true,
        category: true,
        publishedAt: true,
      },
    });

    // Count total posts
    const totalPosts = await prisma.blogPost.count();
    const publishedPostsCount = publishedPosts.length;

    // Extract and count tags
    const tagCounts = new Map<string, number>();
    publishedPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const tags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // Extract and count categories
    const categoryCounts = new Map<string, number>();
    publishedPosts.forEach(post => {
      if (post.category) {
        categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
      }
    });

    const categories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // Generate archives (month/year breakdown)
    const archiveCounts = new Map<string, number>();
    publishedPosts.forEach(post => {
      if (post.publishedAt) {
        const date = new Date(post.publishedAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-based month
        const key = `${year}-${month.toString().padStart(2, '0')}`;
        archiveCounts.set(key, (archiveCounts.get(key) || 0) + 1);
      }
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const archives = Array.from(archiveCounts.entries())
      .map(([key, count]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          year,
          month,
          count,
          monthName: monthNames[month - 1],
        };
      })
      .sort((a, b) => {
        // Sort by year desc, then month desc
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

    return NextResponse.json({
      success: true,
      metadata: {
        tags,
        categories,
        totalPosts,
        publishedPosts: publishedPostsCount,
        archives,
      },
    });

  } catch (error) {
    console.error('Blog metadata error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve blog metadata'
      },
      { status: 500 }
    );
  }
}