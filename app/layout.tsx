import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waveform — MP3 Player",
  description: "Upload and stream MP3 tracks with a sleek dark player.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(129,140,248,0.15),rgba(0,0,0,0))]" />
        <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/20 text-accent-300">
                ♪
              </span>
              Waveform
            </Link>
            <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1 text-sm">
              <Link
                href="/"
                className="rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Listen
              </Link>
              <Link
                href="/admin"
                className="rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                Admin
              </Link>
            </div>
          </nav>
        </header>
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
