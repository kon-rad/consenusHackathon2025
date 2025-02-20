import { StreamingTextResponse } from 'ai';
import Together from 'together-ai';
import { DeepgramAudioService } from '../../services/DeepgramAudioService'; // Adjust path as needed
import { SadTalkerService } from '../../services/SadTalkerService'; // Add this import

// Initialize Together AI client
const together = new Together(process.env.TOGETHER_API_KEY);
const audioService = new DeepgramAudioService();
const sadTalkerService = new SadTalkerService(); // Add this line

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Ensure we have messages
  if (!messages || !Array.isArray(messages)) {
    return new Response('Missing or invalid messages', { status: 400 });
  }

  try {
    const stream = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Trading agent on the Aptos blockchain and a Web3 influencer who creates valuable news and educational content about the Web3 space - always respond in exactly one sentence.'
        },
        ...messages
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Collect the full response for audio generation
    let fullResponse = '';

    // Convert the response to a readable stream
    const textStream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the text response
          for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              fullResponse += content;
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ type: 'text', content }) + '\n'
                )
              );
            }
          }
          
          // Generate audio only
          const audioUrl = await audioService.generateAudio(fullResponse);
          console.log('[Stream] Generated audio file:', audioUrl);
          
          // Generate video using SadTalker
          console.log('[Stream] Starting video generation with SadTalker...');
          // Convert relative paths to absolute URLs
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const fullImageUrl = `https://aiheadshot.s3.us-west-2.amazonaws.com/image-gen/personagen/konrad.jpg`;
          const fullAudioUrl = `${audioUrl}`;
          
          const videoUrl = await sadTalkerService.generateVideo(fullAudioUrl, fullImageUrl);
          console.log('[Stream] Generated video file:', videoUrl);
          
          // Send the video URL
          controller.enqueue(
            new TextEncoder().encode(
              JSON.stringify({ type: 'video', videoUrl }) + '\n'
            )
          );
          
        } catch (error) {
          console.error('[Stream] Error in stream processing:', error);
        } finally {
          controller.close();
        }
      },
    });

    // Return the stream response
    return new StreamingTextResponse(textStream);

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error processing your request', { status: 500 });
  }
} 