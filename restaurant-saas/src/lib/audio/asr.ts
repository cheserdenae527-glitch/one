const API_KEY = "ea43ceb9-f47a-4cba-8ec7-5e0a9c5834d0";

export interface ASRResult {
  text: string;
  durationMs: number;
}

/**
 * 调用火山引擎 ASR，将音频文件转写为文字。
 *
 * @param audioData - 音频文件的 buffer
 * @param format - 音频格式 (mp3 / wav / pcm)
 * @param sampleRate - 采样率 (默认 16000)
 */
export async function transcribeAudio(
  audioData: Buffer,
  format: "mp3" | "wav" | "pcm" = "mp3",
  sampleRate = 16000
): Promise<ASRResult> {
  const base64Audio = audioData.toString("base64");

  const body = {
    app: { appid: API_KEY },
    user: { uid: "agent-user" },
    audio: {
      format,
      rate: sampleRate,
      data: base64Audio,
    },
    request: {
      model_name: "seed-asr",
      enable_punctuation: true,
      enable_itn: true,
    },
  };

  const res = await fetch("https://openspeech.bytedance.com/api/v3/asr/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": API_KEY },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("ASR failed: " + res.status + " " + err.substring(0, 200));
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error("ASR error: " + (data.message || JSON.stringify(data)));
  }

  const text = data?.result?.text || data?.text || "";
  const durationMs = data?.duration || data?.result?.duration || 0;

  return { text, durationMs };
}
