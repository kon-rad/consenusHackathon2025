import { fal } from "@fal-ai/client";

export class SadTalkerService {
  constructor() {
    fal.config({
      credentials: process.env.FAL_KEY
    });
  }

  async generateVideo(audioUrl: string, imageUrl: string): Promise<string> {
    try {
      console.log('Starting video generation using Fal AI', { audioUrl, imageUrl });

      const result = await fal.subscribe("fal-ai/sadtalker", {
        input: {
          source_image_url: imageUrl,
          driven_audio_url: audioUrl
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log('Queue update:', update);
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      console.log("Full result:", JSON.stringify(result, null, 2));
      
      if (!result.data?.video?.url) {
        throw new Error('No video URL in response');
      }

      return result.data.video.url;
    } catch (error) {
      console.error('Error generating video:', {
        error,
        status: error.status,
        details: error.body?.detail
      });
      throw error;
    }
  }
} 