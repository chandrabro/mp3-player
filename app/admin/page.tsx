"use client";

import { useEffect, useRef, useState } from "react";
import { Track, UploadResponse } from "@/lib/types";
import { deleteTrack, getTracks, saveTrack, subscribeToTracks } from "@/lib/storage";
import TrackList from "@/components/TrackList";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function AdminPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [wasMock, setWasMock] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTracks(getTracks());
    const unsubscribe = subscribeToTracks(setTracks);
    return unsubscribe;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setStatus("idle");
    setErrorMessage("");
    if (selected && !title) {
      // Pre-fill title from filename, stripping the extension.
      setTitle(selected.name.replace(/\.mp3$/i, ""));
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Choose an MP3 file first.");
      setStatus("error");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".mp3")) {
      setErrorMessage("Only .mp3 files are supported.");
      setStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");

    // Use XHR (not fetch) so we can surface real upload progress.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        if (xhr.status < 200 || xhr.status >= 300) {
          const parsed = JSON.parse(xhr.responseText);
          throw new Error(parsed.error || "Upload failed.");
        }
        const data: UploadResponse = JSON.parse(xhr.responseText);

        const track: Track = {
          id: crypto.randomUUID(),
          title: title.trim() || data.filename.replace(/\.mp3$/i, ""),
          url: data.url,
          filename: data.filename,
          uploadDate: new Date().toISOString(),
        };

        saveTrack(track);
        setWasMock(Boolean(data.mock));
        setStatus("success");
        resetForm();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Upload failed.");
        setStatus("error");
      }
    };

    xhr.onerror = () => {
      setErrorMessage("Network error during upload. Please try again.");
      setStatus("error");
    };

    xhr.send(formData);
  };

  const handleDelete = (id: string) => {
    deleteTrack(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Admin
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload MP3 tracks and manage what's available on the public player.
        </p>
      </div>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="animate-fade-in rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-glow backdrop-blur sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="file"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              MP3 file
            </label>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 text-sm text-slate-300 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent-500 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-accent-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="title"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Track title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Drive"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-accent-500/50 transition focus:ring-2"
            />
          </div>
        </div>

        {status === "uploading" && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-accent-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Uploading… {progress}%
            </p>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {status === "success" && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-300">
            Track uploaded successfully.
            {wasMock && (
              <span className="mt-1 block text-emerald-400/80">
                Note: no Blob storage credentials were found, so this file
                was embedded locally as a data URL for development. Add{" "}
                <code className="rounded bg-emerald-500/10 px-1 py-0.5">
                  BLOB_READ_WRITE_TOKEN
                </code>{" "}
                to persist uploads to Vercel Blob.
              </span>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "uploading"}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-700 sm:w-auto"
        >
          {status === "uploading" ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Uploading
            </>
          ) : (
            "Upload track"
          )}
        </button>
      </form>

      {/* Track management list */}
      <div className="mt-8 animate-fade-in">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Uploaded tracks ({tracks.length})
        </h2>
        <TrackList
          tracks={tracks}
          onDelete={handleDelete}
          emptyMessage="Nothing uploaded yet. Use the form above to add a track."
        />
      </div>
    </div>
  );
}
