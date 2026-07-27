import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/audio/asr";

export async function POST(request: Request) {
  try {
    const { audio_url, format } = await request.json();
    if (!audio_url) return NextResponse.json({ error: "audio_url is required" }, { status: 400 });

    const resp = await fetch(audio_url);
    if (!resp.ok) throw new Error("Audio download failed: " + resp.status);
    const buffer = Buffer.from(await resp.arrayBuffer());

    const result = await transcribeAudio(buffer, format || "mp3");
    return NextResponse.json(result);
  } catch (error) {
    console.error("ASR error:", error);
    return NextResponse.json({ error: "转写失败", detail: (error as Error).message }, { status: 500 });
  }
}
