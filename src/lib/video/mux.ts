import Mux from '@mux/mux-node';
import jwt from 'jsonwebtoken';

// Initialize Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

// Access Video API
const Video = mux.video;

/**
 * Creates a signed playback URL for a Mux asset
 * @param assetId - The Mux asset ID
 * @param playbackId - The Mux playbook ID (should be private/signed)
 * @returns Promise<string> - The signed playback URL
 */
export async function createSignedPlaybackUrl(
  assetId: string,
  playbackId: string
): Promise<string> {
  try {
  // Generate a short-lived signed token for this playback ID and return URL with token
  const token = await createPlaybackToken(playbackId, { expiresIn: 60 * 60 }); // 1 hour
  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
  } catch (error) {
    console.error('Error creating signed playback URL:', error);
    throw new Error('Failed to create signed playback URL');
  }
}

/**
 * Creates a signed playback token for client-side video players
 * This is the recommended approach for Mux signed URLs
 */
export async function createPlaybackToken(
  playbackId: string,
  options: {
    expiresIn?: number; // seconds from now, defaults to 24 hours
    viewerId?: string; // optional viewer identification
  } = {}
): Promise<string> {
  try {
    const expiresIn = options.expiresIn || 24 * 60 * 60; // default: 24 hours

    const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
    const privateKeyRaw = process.env.MUX_PRIVATE_KEY;

    if (!signingKeyId || !privateKeyRaw) {
      throw new Error('Missing MUX signing credentials. Set MUX_SIGNING_KEY_ID and MUX_PRIVATE_KEY in the environment.');
    }

    // Normalize private key in case it's provided with escaped newlines in env
    const keySecret = privateKeyRaw.replace(/\\n/g, '\n');

    // Sign JWT manually using RS256 per Mux spec
    // Header includes Key ID (kid) and type
    const token = jwt.sign(
      {
        // Mux requires 'aud' claim to indicate usage: 'v' for video
        aud: 'v',
        // Mux expects 'sub' (subject) to be the playback ID
        sub: playbackId,
      },
      keySecret,
      {
        algorithm: 'RS256',
        keyid: signingKeyId,
        expiresIn,
      }
    );

    return token;
  } catch (error) {
    console.error('Error creating playback token:', error);
    throw new Error('Failed to create playback token');
  }
}

/**
 * Gets video asset information from Mux
 */
export async function getVideoAsset(assetId: string) {
  try {
    const asset = await Video.assets.retrieve(assetId);
    return asset;
  } catch (error) {
    console.error('Error fetching video asset:', error);
    throw new Error('Failed to fetch video asset');
  }
}

/**
 * Creates a new video asset in Mux
 * This would typically be used in an admin interface
 */
export async function createVideoAsset(videoUrl: string, options: {
  test?: boolean;
  passthrough?: string;
} = {}) {
  try {
    const asset = await Video.assets.create({
      inputs: [{ url: videoUrl }],
      test: options.test || false,
      passthrough: options.passthrough,
      playback_policy: ['signed'], // Always use signed playback for security
    });
    
    return asset;
  } catch (error) {
    console.error('Error creating video asset:', error);
    throw new Error('Failed to create video asset');
  }
}

export { Video as MuxVideo };