import { NextRequest } from 'next/server';
import { GET } from '@/app/api/videos/[videoId]/playback-info/route';

// Mocks must be declared before imports are used
jest.mock('@/lib/auth/middleware', () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('@/lib/video/mux', () => ({
  createPlaybackToken: jest.fn().mockResolvedValue('signed.jwt.token'),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    video: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { createPlaybackToken } from '@/lib/video/mux';
import type { PlaybackInfoResponse } from '@/types/video';

describe('GET /api/videos/[videoId]/playback-info', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns playbackUrl with token for authorized user', async () => {
    (getAuthenticatedUser as jest.Mock).mockReturnValue({
      id: 'user_1',
      email: 'test@example.com',
      name: 'Test User',
      membershipType: 'PREMIUM',
      membershipStatus: 'ACTIVE',
    });

  const videoRecord = {
      id: 'vid_1',
      title: 'Test',
      streamingUrl: 'playback123',
      membershipRequired: 'BASIC',
      isPublic: false,
  };

  (prisma.video.findUnique as unknown as jest.Mock).mockResolvedValue(videoRecord);

    (createPlaybackToken as jest.Mock).mockResolvedValue('signed.jwt.token');

    const headers = new Headers({
      'x-user-id': 'user_1',
      'x-user-email': 'test@example.com',
      'x-user-membership': 'PREMIUM',
      'x-user-status': 'ACTIVE',
    });

    const req = new NextRequest(new URL('http://localhost/api/videos/vid_1/playback-info'), { headers });

    const routeParams: { params: Promise<{ videoId: string }> } = {
      params: Promise.resolve({ videoId: 'vid_1' }),
    };

  const res = await GET(req, routeParams);
  const json = (await res.json()) as PlaybackInfoResponse;

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  expect(json.playbackInfo).toBeDefined();
  expect(json.playbackInfo!.playbackUrl).toContain(
      'https://stream.mux.com/playback123.m3u8?token='
    );
  });

  it('returns 403 when membership is insufficient for a non-public video', async () => {
    (getAuthenticatedUser as jest.Mock).mockReturnValue({
      id: 'user_basic',
      email: 'basic@example.com',
      name: 'Basic User',
      membershipType: 'BASIC',
      membershipStatus: 'ACTIVE',
    });

    (prisma.video.findUnique as unknown as jest.Mock).mockResolvedValue({
      id: 'vid_2',
      title: 'Premium Only',
      streamingUrl: 'playback999',
      membershipRequired: 'PREMIUM',
      isPublic: false,
    });

    const headers = new Headers({
      'x-user-id': 'user_basic',
      'x-user-email': 'basic@example.com',
      'x-user-membership': 'BASIC',
      'x-user-status': 'ACTIVE',
    });

    const req = new NextRequest(new URL('http://localhost/api/videos/vid_2/playback-info'), { headers });
    const res = await GET(req, { params: Promise.resolve({ videoId: 'vid_2' }) });
    const json = (await res.json()) as PlaybackInfoResponse;

    expect(res.status).toBe(403);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Membership required/i);
  });

  it('returns 404 when video is not found', async () => {
    (getAuthenticatedUser as jest.Mock).mockReturnValue({
      id: 'user_1',
      email: 'test@example.com',
      name: 'Test User',
      membershipType: 'PREMIUM',
      membershipStatus: 'ACTIVE',
    });

    (prisma.video.findUnique as unknown as jest.Mock).mockResolvedValue(null);

    const headers = new Headers({
      'x-user-id': 'user_1',
      'x-user-email': 'test@example.com',
      'x-user-membership': 'PREMIUM',
      'x-user-status': 'ACTIVE',
    });

    const req = new NextRequest(new URL('http://localhost/api/videos/missing/playback-info'), { headers });
    const res = await GET(req, { params: Promise.resolve({ videoId: 'missing' }) });
    const json = (await res.json()) as PlaybackInfoResponse;

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Video not found/i);
  });

  it('returns 500 when video has no streaming URL', async () => {
    (getAuthenticatedUser as jest.Mock).mockReturnValue({
      id: 'user_1',
      email: 'test@example.com',
      name: 'Test User',
      membershipType: 'PREMIUM',
      membershipStatus: 'ACTIVE',
    });

    (prisma.video.findUnique as unknown as jest.Mock).mockResolvedValue({
      id: 'vid_3',
      title: 'Broken Video',
      streamingUrl: null,
      membershipRequired: 'BASIC',
      isPublic: false,
    });

    const headers = new Headers({
      'x-user-id': 'user_1',
      'x-user-email': 'test@example.com',
      'x-user-membership': 'PREMIUM',
      'x-user-status': 'ACTIVE',
    });

    const req = new NextRequest(new URL('http://localhost/api/videos/vid_3/playback-info'), { headers });
    const res = await GET(req, { params: Promise.resolve({ videoId: 'vid_3' }) });
    const json = (await res.json()) as PlaybackInfoResponse;

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/streaming not available/i);
  });
});
