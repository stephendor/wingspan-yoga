# Secure Playback with Mux (Signed Tokens)

This document explains how secure video playback is implemented with Mux and how to verify it end-to-end.

## Overview

- Provider: Mux
- Security: RS256-signed playback JWTs attached as a query param `?token=...`
- Server pieces:
  - `src/lib/video/mux.ts` creates signed tokens and signed URLs
  - `src/app/api/videos/[videoId]/playback-info/route.ts` authenticates the user, checks membership, and returns a tokenized HLS URL
- Client piece:
  - `VideoPlayer` fetches `/api/videos/[videoId]/playback-info` and loads the returned HLS URL in Plyr

## Environment variables

Set these in your local `.env` (and hosting platform secrets):

```env
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_SIGNING_KEY_ID=your_mux_playback_signing_key_id
# If you copy the PEM in one line, escape newlines as \n
MUX_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
# Optional: override default 8h token TTL during testing (in seconds)
MUX_TOKEN_TTL_SECONDS=28800
```

Notes:

- Mux “Signing Keys” are separate from API keys. Create one in Mux Dashboard → Settings → Signing Keys.
- The private key PEM may be stored with escaped newlines (as above). The code normalizes it.

## How it works

1. Client requests: `GET /api/videos/:videoId/playback-info`

1. Server checks authentication and membership entitlements.

1. Server signs a JWT with RS256 (header.kid=`MUX_SIGNING_KEY_ID`) and claims: `aud: 'v'`, `sub: <playbackId>`, `exp: now + TTL`.

1. Response contains a URL: `https://stream.mux.com/<playbackId>.m3u8?token=<jwt>`

1. Player loads HLS URL. Mux validates the token and serves the stream only if valid.

## E2E verification steps

Prereqs: Have at least one `Video` record with `streamingUrl` set to a valid Mux playback ID and a test user with the appropriate membership.

### Authenticated playback succeeds

- Login as a member with required access.
- Open a video page that uses `VideoPlayer`.
- Verify the video plays. In DevTools → Network, you should see the HLS manifest `...m3u8?token=...`.

### Direct access without token is denied

- Copy the manifest URL and remove the `?token=...` query.
- Open the bare URL in a new tab (or curl). Expect 403/401 from Mux.

### Expired token is denied

- Temporarily change the token TTL to a very short value (e.g., 5s) in `createPlaybackToken` when testing.
- Request playback info, wait for expiry, then reload the HLS URL. Expect denial.
- Revert TTL to the normal value (e.g., 8h) afterward.

### Membership gating works

- With a BASIC user, request playback for a PREMIUM video.
- Expect 403 and JSON error from `/api/videos/:id/playback-info`.

## Automated tests

Added targeted Jest tests:

- `tests/videos/playback-info.test.ts`
  - Authorized happy-path returns tokenized URL
  - 403 for insufficient membership
  - 404 when video not found
  - 500 when `streamingUrl` is missing

Note: Some unrelated suites require DB access. You can run only these tests:

```bash
npx jest tests/videos/playback-info.test.ts
```

## Operational tips

- Rotate signing keys periodically in Mux. Deploy new `MUX_SIGNING_KEY_ID` and `MUX_PRIVATE_KEY` together.
- Keep tokens short-lived (hours). Client can re-fetch playback-info when nearing expiry.
- Ensure all assets are created with `playback_policy: ['signed']`.
- For ad-hoc checks, generate a signed URL locally:
  - `npm run mux:url -- <PLAYBACK_ID> --ttl 3600`

## Troubleshooting

- 401 from playback-info: verify auth headers/session.
- 403 from playback-info: check membershipRequired vs user membership.
- 403/401 from Mux stream: token missing/expired/invalid, wrong `kid`, or mismatched `sub` (playback ID).
- Invalid private key: ensure PEM formatting; escaped `\n` in env is supported and normalized.
