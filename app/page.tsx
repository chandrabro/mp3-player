"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Track } from "@/lib/types";
import { getTracks, subscribeToTracks } from "@/lib/storage";
import AudioPlayer from "@/components/AudioPlayer";
import TrackList from "@/components/TrackList";

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = getTracks();
    setTracks(initial);
    setActiveTrack(initial[0] ?? null);
    setHydrated(true);

    const unsubscribe = subscribeToTracks((updated) => {
      setTracks(updated);
      // If the active track was deleted elsewhere, fall back gracefully.
      setActiveTrack((current) => {
        if (current && updated.some((t) => t.id === current.id)) {
          return current;
        }
        return updated[0] ?? null;
      });
    });

    return unsubscribe;
  }, []);

  const handleSelect = (track: Track) => setActiveTrack(track);

  const handleEnded = () => {
    if (!activeTrack) return;
    const idx = tracks.findIndex((t) => t.id === activeTrack.id);
    const next = tracks[idx + 1];
    if (next) setActiveTrack(next);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Listen
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Stream tracks uploaded through the admin panel.
        </p>
      </div>

      <div className="animate-fade-in">
        <AudioPlayer track={activeTrack} onEnded={handleEnded} />
      </div>

      <div className="mt-8 animate-fade-in">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Tracklist
        </h2>
        {hydrated && tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">
            No tracks uploaded yet. Head over to{" "}
            <Link href="/admin" className="text-accent-300 underline underline-offset-2">
              /admin
            </Link>{" "}
            to add your first song.
          </div>
        ) : (
          <TrackList
            tracks={tracks}
            activeTrackId={activeTrack?.id}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
}
