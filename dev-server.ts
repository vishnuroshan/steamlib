/**
 * Local Development Server
 * 
 * Runs the Vercel serverless functions locally for development.
 * Use: npm run dev:api
 * 
 * (Touched to trigger restart)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from 'express';
import cors from 'cors';

// We'll import handlers dynamically inside the startup to ensure env vars are loaded
async function startServer() {
    const { default: resolveVanityHandler } = await import('./api/resolve-vanity');
    const { default: getOwnedGamesHandler } = await import('./api/get-owned-games');
    const { default: getGameDetailsHandler } = await import('./api/get-game-details');

    const app = express();
    const PORT = 3001;

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Create mock Vercel request/response adapters
    function createVercelAdapter(handler: Function) {
        return async (req: express.Request, res: express.Response) => {
            // Create a mock Vercel request object
            const vercelReq = {
                method: req.method,
                body: req.body,
                query: req.query,
                headers: req.headers,
            };

            // Create a mock Vercel response object
            const vercelRes = {
                status: (code: number) => ({
                    json: (data: unknown) => res.status(code).json(data),
                }),
                json: (data: unknown) => res.json(data),
            };

            try {
                await handler(vercelReq, vercelRes);
            } catch (error) {
                console.error('API Error:', error);
                res.status(500).json({ success: false, error: 'SERVER_ERROR' });
            }
        };
    }

    // Routes
    app.post('/api/resolve-vanity', createVercelAdapter(resolveVanityHandler));
    app.post('/api/get-owned-games', createVercelAdapter(getOwnedGamesHandler));
    app.post('/api/get-game-details', createVercelAdapter(getGameDetailsHandler));

    // Health check
    app.get('/api/health', (_, res) => {
        res.json({ status: 'ok', hasApiKey: !!process.env.STEAM_API_KEY });
    });

    app.listen(PORT, () => {
        console.log(`\n🎮 Steam API server running at http://localhost:${PORT}`);
        console.log(`   Steam API Key: ${process.env.STEAM_API_KEY ? '✓ configured' : '✗ missing'}`);
        console.log(`\n   Endpoints:`);
        console.log(`   POST /api/resolve-vanity`);
        console.log(`   POST /api/get-owned-games`);
        console.log(`   GET  /api/health\n`);
    });
}

startServer();
