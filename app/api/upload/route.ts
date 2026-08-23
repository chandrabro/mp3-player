import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Attach a file under the 'file' field." },
        { status: 400 }
      );
    }

    const isMp3 =
      file.type === "audio/mpeg" ||
      file.type === "audio/mp3" ||
      file.name.toLowerCase().endsWith(".mp3");

    if (!isMp3) {
      return NextResponse.json(
        { error: "Only .mp3 files are supported." },
        { status: 400 }
      );
    }

    const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    // --- Fallback path: no Vercel Blob credentials configured locally ---
    // Instead of failing local development, we encode the file as a data
    // URI so the rest of the app (admin + player) keeps working end to end.
    // This is NOT suitable for production — it's a dev-only convenience.
    if (!hasBlobToken) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:audio/mpeg;base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        filename: file.name,
        mock: true,
      });
    }

    // --- Real path: upload to Vercel Blob storage ---
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const blob = await put(`tracks/${timestamp}-${safeName}`, file, {
      access: "public",
      contentType: "audio/mpeg",
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      mock: false,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
