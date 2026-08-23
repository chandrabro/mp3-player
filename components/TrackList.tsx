"use client";

import { Track } from "@/lib/types";
import { formatDate } from "@/lib/storage";

export default function TrackList({
  tracks,
  activeTrackId,
  onSelect,
  onDelete,
  emptyMessage = "No tracks yet.",
}: {
  tracks: Track[];
  activeTrackId?: string | null;
  onSelect?: (track: Track) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}) {
  if (tracks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="thin-scrollbar flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
      {tracks.map((track) => {
        const isActive = track.id === activeTrackId;
        return (
          <li
            key={track.id}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition ${
              isActive
                ? "border-accent-500/50 bg-accent-500/10"
                : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <button
              onClick={() => onSelect?.(track)}
              disabled={!onSelect}
              className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm ${
                  isActive
                    ? "bg-accent-500 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {isActive ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  "♪"
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-medium ${
                    isActive ? "text-accent-200" : "text-slate-200"
                  }`}
                >
                  {track.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {formatDate(track.uploadDate)}
                </p>
              </div>
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(track.id)}
                aria-label={`Delete ${track.title}`}
                className="flex-shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M6 7h12l-1 13a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7zm3-3h6l1 2H8l1-2z" />
                </svg>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
