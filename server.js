require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');

// LowDB Setup
const { JSONFilePreset } = require('lowdb/node');
const defaultData = {
    zones: {
        left: { type: 'markdown', content: '# Vítejte\nČekám na instrukce z n8n.' },
        center: { type: 'markdown', content: '# MY DVA Graficon\nDashboard je online: $time' },
        right: { type: 'markdown', content: 'Aktuální den: $day' }
    },
    notifications: []
};
let db;

// Initialize DB
async function initDB() {
    db = await JSONFilePreset('db.json', defaultData);
}
initDB();

// NEW Security Setup: Bearer Token Authentication
// Token is stored in process.env.API_TOKEN
// ROBUST AUTHENTICATION (Header OR Body)
const checkToken = async (request, reply) => {
    let token = null;

    // 1. Try Authorization Header (Lenient)
    const authHeader = request.headers['authorization'];
    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            token = authHeader; // Accept raw token in header
        }
    }

    // 2. Fallback: Try Body (apiToken property)
    // Useful when proxies strip headers
    if (!token && request.body && typeof request.body === 'object' && request.body.apiToken) {
        token = request.body.apiToken;
    }

    // 3. Validate
    if (!token) {
        console.warn('[Auth] Failed: No token found in Header or Body.');
        // Optional: console.debug('[Auth] Headers:', request.headers);
        reply.code(401).send({ error: 'Missing token. Send via Authorization header or "apiToken" in body.' });
        return;
    }

    if (token !== process.env.API_TOKEN) {
        console.warn('[Auth] Failed: Invalid token provided.');
        reply.code(403).send({ error: 'Invalid token' });
        return;
    }
};

// Static Files (Frontend)
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'frontend/dist'),
    prefix: '/', // optional: default '/'
});

// API Routes
fastify.register(async function (fastify, opts) {

    // GET /api/state (Public)
    fastify.get('/api/state', async (request, reply) => {
        await db.read();
        return db.data.zones;
    });

    // POST /api/zones/:id (Protected)
    fastify.post('/api/zones/:id', { onRequest: checkToken }, async (request, reply) => {
        const { id } = request.params;
        const { type, content } = request.body;

        if (!['left', 'center', 'right'].includes(id)) {
            reply.code(400).send({ error: 'Neplatná zóna (left, center, right)' });
            return;
        }

        await db.update(({ zones }) => {
            zones[id] = { type, content };
        });

        return { status: 'updated', zone: id, data: db.data.zones[id] };
    });

    // POST /api/notify (Protected)
    fastify.post('/api/notify', { onRequest: checkToken }, async (request, reply) => {
        const { message, style } = request.body;

        // Add to notifications (in-memory or DB, here using DB for persistence/consistency)
        // For simpler implementation as requested "or memory", but DB is cleaner with LowDB
        await db.update(({ notifications }) => {
            notifications.push({ message, style, timestamp: new Date().toISOString() });
        });

        // In a real app, you might want to clean up old notifications or use a different mechanism for "triggering"
        // For now, we just store it. The frontend would need to poll or use SSE to see it, 
        // but the requirement says "frontend will use to trigger the overlay".
        // Assuming frontend polls /api/state or similar, but /api/state only returns zones.
        // Let's add notifications to /api/state response or create a separate endpoint if needed.
        // The requirement says "GET /api/state (Public): Returns the entire zones object".
        // It doesn't explicitly say it returns notifications.
        // However, "frontend will use to trigger the overlay".
        // I'll stick to the requirement: /api/state returns zones.
        // Maybe the frontend will poll a different endpoint for notifications?
        // Or maybe I should include notifications in /api/state?
        // "Returns the entire zones object from the database" -> implies only zones.
        // But "POST /api/notify ... adds it ... to the notifications array ... which the frontend will use".
        // If the frontend uses it, it must be able to read it.
        // I will assume for now that I should expose notifications somewhere.
        // Let's modify /api/state to return { zones, notifications } or just return the whole db.data?
        // Requirement: "GET /api/state (Public): Returns the entire zones object".
        // Strict reading: only zones.
        // But then how does frontend get notifications?
        // I will assume the user might have missed that or implies it's part of the state.
        // For now, I will return ONLY zones in /api/state as strictly requested.
        // I'll add a separate GET /api/notifications just in case, or maybe the user intends to use SSE later?
        // Or maybe "zones" object in DB structure was meant to include notifications?
        // No, DB structure has "zones" and "notifications" as siblings.
        // I'll stick to the plan: /api/state returns zones.
        // I will add a GET /api/notifications endpoint just to be safe and helpful, 
        // or I can return the whole root object if I change the endpoint description.
        // "Returns the entire zones object" is specific.
        // I'll add GET /api/notifications public endpoint.

        return { status: 'notification_added' };
    });

    // Helper to get notifications
    fastify.get('/api/notifications', async (request, reply) => {
        await db.read();
        return db.data.notifications;
    });

});

// Fallback for SPA (Serve index.html for unknown routes)
fastify.setNotFoundHandler((req, res) => {
    res.sendFile('index.html');
});

// Start Server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
