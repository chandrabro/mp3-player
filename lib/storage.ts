import { Track } from "./types";

const STORAGE_KEY = "mp3-player-tracks";
const TRACKS_UPDATED_EVENT = "mp3-tracks-updated";

/**
 * Reads the full track list from localStorage.
 * Safe to call on the server (returns []) since it guards for `window`.
 */
export function getTracks(): Track[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Track[];
  } catch (err) {
    console.error("Failed to read tracks from localStorage:", err);
    return [];
  }
}

function persistTracks(tracks: Track[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  // Notify listeners in the SAME tab (the native `storage` event only fires
  // for other tabs), so the admin/public pages can stay in sync live.
  window.dispatchEvent(new CustomEvent(TRACKS_UPDATED_EVENT));
}

export function saveTrack(track: Track): Track[] {
  const tracks = getTracks();
  const updated = [track, ...tracks];
  persistTracks(updated);
  return updated;
}

export function deleteTrack(id: string): Track[] {
  const tracks = getTracks().filter((t) => t.id !== id);
  persistTracks(tracks);
  return tracks;
}

/**
 * Subscribes to track-list changes, both from this tab (custom event) and
 * other tabs (native storage event). Returns an unsubscribe function.
 */
export function subscribeToTracks(callback: (tracks: Track[]) => void) {
  const handler = () => callback(getTracks());

  window.addEventListener(TRACKS_UPDATED_EVENT, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) handler();
  });

  return () => {
    window.removeEventListener(TRACKS_UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
