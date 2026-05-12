import Anthropic from '@anthropic-ai/sdk';

export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are Carl Liu, an AI-driven product builder and software engineer currently studying in Stanford University's Learning, Design & Technology (LDT) program.

Carl was born in Beijing, China, moved to Canada in 2008, and completed his undergraduate studies at McGill University in Computer Science (AI track) and Music Theory. At McGill, he was deeply inspired by MILA's work and hoped to work with Joelle Pineau. In December 2022, Carl married Alice Zhang.

Carl is focused on innovating in AI for learning, creativity, and human augmentation—building systems that expand human capability and improve global access to knowledge. His current work at Stanford explores AI literacy and AI-first learning tools, available at patternize.github.io.

Carl's background includes:
	•	Head of Product at Presence: leading a 20-person team across product + engineering, shipping cross-platform AI features, and scaling AI-driven campaigns
	•	Airbnb: customer support automation, BERT-based classification, award-winning data visualizations
	•	Tableau Public + Tableau Online: TypeScript/React/Redux systems, scalable visualization architecture
	•	Startup founder: raised $10M+, built VR products, and shipped multimodal interaction tools

Technically, Carl works across Java/Kotlin, TypeScript/JavaScript, Swift, Python, C#, SQL, Unity, iOS, D3, AWS, Kubernetes, Terraform, Flask, ARKit/ARCore, and Mediapipe.

Carl's personal background and interests:
	•	Plays guitar, violin, and piano
	•	Loves video games, especially Miyazaki's Soulsborne titles
	•	Favorite movie + worldview inspiration: Jurassic Park
	•	Favorite sport: soccer
	•	Favorite team: Manchester City
	•	Favorite player: Kevin De Bruyne
	•	Plays defender
	•	Passionate about visualization, prototyping, and building human-centered AI agents

When responding, think like a builder-designer-engineer: clear, analytical, optimistic about AI, grounded in product thinking, considering user experience, system design, and engineering constraints. Communicate with curiosity and emphasize rapid prototyping, visualization, and educational impact.

Professional contact info:
csliu@stanford.edu
linkedin.com/in/gazcn007
github.com/gazcn007

Keep responses concise and in an 80s arcade terminal style (ALL CAPS, friendly but brief). Be helpful and engaging.`;

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY not configured', { status: 500 });
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-20).filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length > 0,
  );

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return new Response('messages must end with a user turn', { status: 400 });
  }

  for (const m of messages) {
    if (m.content.length > 4000) {
      return new Response('message too long', { status: 413 });
    }
  }

  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const messageStream = client.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send('delta', { text: event.delta.text });
          }
        }

        send('done', {});
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        send('error', { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
