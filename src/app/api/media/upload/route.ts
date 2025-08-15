import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

interface MediaUploadResponse {
  success: boolean;
  media?: {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<MediaUploadResponse>> {
  try {
    // Check authentication
    const authUser = getAuthenticatedUser(request);
    
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'INSTRUCTOR')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Admin or Instructor access required.'
        },
        { status: 401 }
      );
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.'
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const baseFilename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
    const filename = `${baseFilename}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Process image metadata and create thumbnail
    let width: number | undefined;
    let height: number | undefined;
    let thumbnailUrl: string | undefined;

    if (isImage) {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;

        // Create thumbnail for images
        const thumbnailFilename = `thumb-${baseFilename}.webp`;
        const thumbnailPath = path.join(UPLOAD_DIR, thumbnailFilename);
        
        await sharp(buffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);
        
        thumbnailUrl = `/uploads/${thumbnailFilename}`;
      } catch (error) {
        console.error('Error processing image:', error);
        // Continue without thumbnail if processing fails
      }
    }

    // For videos, we'd need additional processing (thumbnail generation, duration extraction)
    // For now, we'll just store basic metadata
    if (isVideo) {
      // TODO: Add video processing with ffmpeg for thumbnails and duration
      // For now, just set basic dimensions for videos
      width = 1920; // Default width, should be extracted from video metadata
      height = 1080; // Default height, should be extracted from video metadata
    }

    // Save media metadata to database
    const media = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        url: `/uploads/${filename}`,
        thumbnailUrl,
        uploadedBy: authUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        url: media.url,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        width: media.width || undefined,
        height: media.height || undefined,
        thumbnailUrl: media.thumbnailUrl || undefined,
      },
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload media'
      },
      { status: 500 }
    );
  }
}

// Configure for handling large files
export const runtime = 'nodejs';