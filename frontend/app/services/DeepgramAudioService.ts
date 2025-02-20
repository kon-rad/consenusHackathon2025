import { createClient } from "@deepgram/sdk";
import fs from "fs";
import path from "path";
import os from "os";
import dotenv from "dotenv";
import { S3Service } from "./S3Service";
import { ReadableStream } from "stream";

dotenv.config();

const maleVoice = 'aura-zeus-en';
const femaleVoice = 'aura-stella-en';

export class DeepgramAudioService {
  private deepgram;
  private s3Service;

  private readonly DEFAULT_VOICE_ID = maleVoice;

  constructor() {
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    this.s3Service = new S3Service();
  }

  async generateAudio(text: string, voiceId: string = this.DEFAULT_VOICE_ID): Promise<string> {
    try {
      const truncatedText = text.slice(0, 1990);
      console.log('Starting audio generation with Deepgram', { text: truncatedText, voiceId });

      const response = await this.deepgram.speak.request(
        { text: truncatedText },
        {
          model: voiceId,
          encoding: "linear16",
          container: "wav",
        }
      );

      const stream = await response.getStream();
      if (!stream) {
        throw new Error('Failed to get audio stream from Deepgram');
      }

      // Create temporary file
      const tempFilePath = path.join(os.tmpdir(), `temp_audio_${Date.now()}.wav`);
      await this.streamToFile(stream, tempFilePath);
      
      // Upload to S3 and get URL
      const fileName = `audio_${Date.now()}_${voiceId}.wav`;
      const s3Url = await this.s3Service.uploadAudio(tempFilePath, fileName);
      
      return s3Url;
    } catch (error) {
      console.error('Error generating audio with Deepgram', { error });
      throw error;
    }
  }

  private async streamToFile(stream: ReadableStream, filePath: string): Promise<void> {
    const reader = stream.getReader();
    const writeStream = fs.createWriteStream(filePath);
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writeStream.write(Buffer.from(value));
      }
    } finally {
      writeStream.end();
      await new Promise((resolve) => writeStream.on('finish', resolve));
    }
  }
}