import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs'

function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const routeName = parsedUrl.pathname.replace(/^\/api\//, '').split('/')[0];
          const modulePath = path.resolve(process.cwd(), `api/${routeName}.js`);

          if (!fs.existsSync(modulePath)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Not found: ${routeName}` }));
            return;
          }

          // Parse query
          const query: Record<string, string> = {};
          parsedUrl.searchParams.forEach((v, k) => { query[k] = v; });
          (req as any).query = query;

          // Parse body if needed
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const bodyStr = Buffer.concat(buffers).toString('utf-8');
            if (bodyStr.trim()) {
              try {
                (req as any).body = JSON.parse(bodyStr);
              } catch {
                (req as any).body = bodyStr;
              }
            } else {
              (req as any).body = {};
            }
          } else {
            (req as any).body = {};
          }

          // Enhance response object with status() and json()
          (res as any).status = function (code: number) {
            res.statusCode = code;
            return res;
          };
          (res as any).json = function (data: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          const fileUrl = url.pathToFileURL(modulePath).href;
          const mod = await import(fileUrl);
          const handler = mod.default;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Handler is not a function' }));
          }
        } catch (err: any) {
          console.error('[API dev server error]:', err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tailwindcss(), apiDevServer()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
