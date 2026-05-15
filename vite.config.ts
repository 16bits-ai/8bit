import { Buffer } from 'node:buffer';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

type LocalApiModule = {
  default: (req: Request) => Promise<Response>;
};

const readRequestBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const toWebHeaders = (req: IncomingMessage) => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value) {
      headers.set(key, value);
    }
  }
  return headers;
};

const sendWebResponse = async (res: ServerResponse, response: Response) => {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end(await response.text());
    return;
  }

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
};

const localApiPlugin = (): Plugin => ({
  name: 'local-api-routes',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/chat', async (req, res) => {
      try {
        const { default: handler } = (await server.ssrLoadModule('/api/chat.ts')) as LocalApiModule;
        const origin = `http://${req.headers.host ?? 'localhost:5173'}`;
        const path = req.url && req.url !== '/' ? `/api/chat${req.url}` : '/api/chat';
        const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readRequestBody(req);

        const request = new Request(new URL(path, origin), {
          method: req.method,
          headers: toWebHeaders(req),
          body,
        });

        await sendWebResponse(res, await handler(request));
      } catch (error) {
        console.error('Local API route failed:', error);
        res.statusCode = 500;
        res.end('Local API route failed');
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }

  return {
    base: '/', // Explicitly set base path for GitHub Pages with custom domain
    plugins: [react(), localApiPlugin()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    assetsInclude: ['**/*.MP4', '**/*.mp4', '**/*.MOV', '**/*.mov', '**/*.webm', '**/*.avi', '**/*.mkv'],
  };
});
