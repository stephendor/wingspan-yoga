import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MediaAccessLevel } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

interface BulkUpdateBody {
  ids: string[];
  tags?: string[];
  addTags?: string[];
  removeTags?: string[];
  categoryId?: string | null;
  accessLevel?: string;
  directory?: string | null;
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as BulkUpdateBody;
    const { ids, tags, addTags, removeTags, categoryId, accessLevel, directory } = body;

    if (!ids || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No media IDs provided' }, { status: 400 });
    }

    // Build updates
    const updates: Record<string, unknown> = {};
    if (tags) updates['tags'] = tags;
    if (typeof categoryId !== 'undefined') updates['categoryId'] = categoryId;
    if (typeof directory !== 'undefined') updates['directory'] = directory;
    if (accessLevel && Object.values(MediaAccessLevel).includes(accessLevel as MediaAccessLevel)) {
      updates['accessLevel'] = accessLevel as MediaAccessLevel;
    }

    // Apply direct field updates
    if (Object.keys(updates).length > 0) {
      await prisma.media.updateMany({
        where: { id: { in: ids } },
        data: updates,
      });
    }

    // Handle add/remove tags per item
    if ((addTags && addTags.length) || (removeTags && removeTags.length)) {
      await Promise.all(
        ids.map((id) =>
          prisma.media
            .update({
              where: { id },
              data: {
                ...(addTags && addTags.length ? { tags: { push: addTags } } : {}),
              },
            })
            .then(async () => {
              if (removeTags && removeTags.length) {
                const m = await prisma.media.findUnique({ where: { id }, select: { tags: true } });
                const next = (m?.tags || []).filter((t) => !removeTags.includes(t));
                await prisma.media.update({ where: { id }, data: { tags: next } });
              }
            })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk media update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to perform bulk update' }, { status: 500 });
  }
}
