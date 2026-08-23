"use client";

import { useEffect, useRef, useState } from "react";
import { Track } from "@/lib/types";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  track,
  onEnded,
}: {
  track: Track | null;
  onEnded?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Load & auto-play whenever the active track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, onEnded]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const value = Number(e.target.value);
    setVolume(value);
    setIsMuted(value === 0);
    if (audio) audio.volume = value;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.volume = nextMuted ? 0 : volume || 0.8;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-glow backdrop-blur sm:p-6">
      <audio ref={audioRef} preload="metadata">
        {track && <source src={track.url} type="audio/mpeg" />}
      </audio>

      {/* Now playing info */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/30 to-accent-700/20 text-2xl">
          🎧
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white sm:text-lg">
            {track ? track.title : "No track selected"}
          </p>
          <p className="text-sm text-slate-400">
            {track ? "Now playing" : "Choose a song from the list below"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          disabled={!track}
          style={
            {
              "--range-progress": `${progressPercent}%`,
            } as React.CSSProperties
          }
          className="w-full disabled:cursor-not-allowed disabled:opacity-40"
        />
        <div className="mt-1.5 flex justify-between text-xs text-slate-400 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={togglePlay}
          disabled={!track}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/30 transition hover:bg-accent-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex flex-1 items-center justify-end gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="text-slate-400 transition hover:text-white"
          >
            {isMuted || volume === 0 ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M16.5 12A4.5 4.5 0 0014 8v2.17l2.5 2.5c0-.22.02-.45.02-.67zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L18.73 21 20 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={
              { "--range-progress": `${volumePercent}%` } as React.CSSProperties
            }
            className="w-24 sm:w-28"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
