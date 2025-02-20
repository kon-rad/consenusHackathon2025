import { fal } from "@fal-ai/client";

export class FalTextToSpeechService {
  // Default voice reference URL - replace with your preferred default voice
  private readonly DEFAULT_VOICE_URL = "aura-luna-en";

  constructor() {
    // Initialize fal client with your API key
    fal.config({
      credentials: process.env.FAL_AI_API_KEY,
    });
  }

  async generateAudio(text: string, voiceId?: string): Promise<string> {
    try {
      const result = await fal.subscribe("fal-ai/f5-tts", {
        input: {
          gen_text: text,
          ref_audio_url: voiceId || this.DEFAULT_VOICE_URL,
          model_type: "F5-TTS",
          remove_silence: true
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      if (!result.data?.audio_url?.url) {
        throw new Error("No audio URL in response");
      }

      return result.data.audio_url.url;
    } catch (error) {
      console.error("Error generating audio from text:", error);
      throw error;
    }
  }
} 