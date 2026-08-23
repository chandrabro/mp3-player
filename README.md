# Waveform — MP3 Upload & Player

A full-stack Next.js 14 (App Router) app for uploading and streaming MP3
tracks, built with TypeScript, Tailwind CSS, and `@vercel/blob`.

## Features

- **`/api/upload`** — accepts an `.mp3` file via `FormData`, uploads it to
  Vercel Blob in public mode, and returns `{ url, filename }`. If
  `BLOB_READ_WRITE_TOKEN` isn't set, it automatically falls back to a local
  mock response (a base64 data URL) so development never breaks.
- **`/admin`** — drag-in upload form with a real progress bar (via XHR),
  a title field, success/error states, and a management list with delete.
  Uploaded track metadata is persisted to `localStorage`.
- **`/`** — public listening page with a custom `<audio>`-based player
  (play/pause, seek bar, volume, elapsed/duration) and a tracklist read from
  `localStorage`. Clicking a track loads it into the player; tracks
  auto-advance when one ends.
- Dark theme throughout, responsive down to mobile widths.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the player and `http://localhost:3000/admin`
to upload tracks.

## Connecting real Vercel Blob storage

1. In your Vercel project, go to **Storage → Create → Blob**.
2. Copy the generated `BLOB_READ_WRITE_TOKEN`.
3. Add it to `.env.local`:

   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
   ```

4. Restart the dev server. Uploads will now persist to Blob storage instead
   of the local mock fallback.

## Notes on the localStorage-based track list

Track metadata (title, URL, upload date) lives in the browser's
`localStorage`, not a database — this keeps the demo simple and installable
with zero extra setup. Because of that:

- The track list is **per-browser**, not shared across devices/users.
- If you swap the mock fallback for real Blob uploads, the *files* persist
  in Blob storage, but the *list of tracks* pointing to them only exists in
  whichever browser uploaded them. For a shared, multi-user track list,
  swap `lib/storage.ts` for calls to a real database (Vercel KV/Postgres,
  etc.) behind a small API route.

## Project structure

```
app/
  api/upload/route.ts   # Upload API route (Blob + mock fallback)
  admin/page.tsx         # Admin upload + management UI
  page.tsx                # Public player + tracklist
  layout.tsx               # Shared dark-theme layout/nav
  globals.css               # Tailwind + custom range-slider styling
components/
  AudioPlayer.tsx        # Custom <audio> player UI
  TrackList.tsx            # Shared tracklist UI (select + delete)
lib/
  types.ts                  # Track / UploadResponse types
  storage.ts                # localStorage read/write + cross-tab sync
```
