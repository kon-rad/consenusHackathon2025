import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export class S3Service {
  private s3Client: S3Client;
  private readonly S3_UPLOAD_BUCKET = "aiheadshot";
  private readonly BASE_PATH = "image-gen/personagen";

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_UPLOAD_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_UPLOAD_KEY || "",
        secretAccessKey: process.env.S3_UPLOAD_SECRET || "",
      },
    });
  }

  async uploadAudio(filePath: string, fileName: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath);
      const key = `${this.BASE_PATH}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.S3_UPLOAD_BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: "audio/wav",
      });

      await this.s3Client.send(command);

      // Generate the S3 URL
      const s3Url = `https://${this.S3_UPLOAD_BUCKET}.s3.amazonaws.com/${key}`;
      
      // Clean up local file
      fs.unlinkSync(filePath);
      
      console.log('Audio file uploaded to S3:', s3Url);
      return s3Url;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }
} 