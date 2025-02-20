import axios from 'axios';

export class HeyGenService {
  private apiKey: string;
  private uploadUrl: string = 'https://upload.heygen.com/v1/talking_photo';
  private videoGenerateUrl: string = 'https://api.heygen.com/v2/video/generate';

  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('HEYGEN_API_KEY is not configured');
    }
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      // Download the image first
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');

      // Upload to HeyGen
      const response = await axios.post(this.uploadUrl, imageBuffer, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'image/jpeg',
        },
      });

      // Log the entire response for debugging
      console.log("HeyGen upload response:", {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      if (!response.data) {
        throw new Error('Empty response from HeyGen upload');
      }

      if (typeof response.data === 'string') {
        try {
          response.data = JSON.parse(response.data);
        } catch (e) {
          console.error('Failed to parse response data:', response.data);
          throw new Error('Invalid JSON response from HeyGen upload');
        }
      }

      if (!response.data.data?.talking_photo_id) {
        console.error('Response data structure:', response.data);
        throw new Error('Invalid response from HeyGen upload: Missing talking_photo_id');
      }

      console.log("uploadImage response data:", response.data);
      return response.data.data.talking_photo_id;
    } catch (error) {
      console.error('Error uploading image to HeyGen:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }

  private async waitForVideoCompletion(videoId: string, maxAttempts = 60): Promise<string> {
    const checkInterval = 3000; // 3 seconds between checks
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
          {
            headers: {
              'x-api-key': this.apiKey,
            },
          }
        );

        console.log('Video status check response:', {
          status: response.status,
          data: response.data
        });

        const status = response.data?.data?.status;
        const videoUrl = response.data?.data?.video_url;
        const error = response.data?.data?.error;

        if (status === 'completed' && videoUrl) {
          return videoUrl;
        } else if (status === 'failed') {
          // Properly stringify the error object if it exists
          const errorMessage = error ? JSON.stringify(error, null, 2) : 'Unknown error';
          throw new Error(`Video generation failed. Error: ${errorMessage}`);
        }

        console.log(`Video status check attempt ${attempts + 1}/${maxAttempts}: ${status}`);
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        attempts++;
      } catch (error) {
        console.error('Error checking video status:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
          });
        }
        throw error;
      }
    }

    throw new Error('Video generation timed out');
  }

  async generateVideo(audioUrl: string, imageUrl: string): Promise<string> {
    try {
      const talkingPhotoId = await this.uploadImage(imageUrl);

      const response = await axios.post(
        this.videoGenerateUrl,
        {
          video_inputs: [
            {
              character: {
                type: "talking_photo",
                talking_photo_id: talkingPhotoId
              },
              voice: {
                type: "audio",
                audio_url: audioUrl
              },
              background: {
                type: "color",
                value: "#FAFAFA"
              }
            }
          ],
          dimension: {
            width: 1280,
            height: 720
          }
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      // Check for successful response code
      if (response.data?.code !== 100) {
        throw new Error(`HeyGen API error: ${response.data?.message || 'Unknown error'}`);
      }

      if (!response.data?.data?.video_id) {
        throw new Error('No video ID received from HeyGen');
      }

      console.log('Video generation initiated successfully:', {
        videoId: response.data.data.video_id,
        code: response.data.code,
        message: response.data.message
      });

      // Wait for video to complete and get the final video URL
      const videoUrl = await this.waitForVideoCompletion(response.data.data.video_id);
      return videoUrl;
    } catch (error) {
      console.error('Error in HeyGen video generation:', error);
      throw error;
    }
  }
} 