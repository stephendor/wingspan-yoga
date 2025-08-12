#!/usr/bin/env tsx
/**
 * Helper: generate a signed Mux playback URL for a given playback ID.
 * Usage:
 *   tsx scripts/mux-url.ts <PLAYBACK_ID> [--ttl 3600]
 */

import { createPlaybackToken } from '../src/lib/video/mux';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: tsx scripts/mux-url.ts <PLAYBACK_ID> [--ttl 3600]');
    process.exit(1);
  }

  const playbackId = args[0];
  const ttlIndex = args.indexOf('--ttl');
  const ttl = ttlIndex >= 0 && args[ttlIndex + 1] ? Number(args[ttlIndex + 1]) : undefined;

  const token = await createPlaybackToken(playbackId, { expiresIn: ttl });
  const url = `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
  console.log(url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
