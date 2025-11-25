require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');

// Basic Auth Setup
const authenticate = { realm: 'Graficon' };
fastify.register(require('@fastify/basic-auth'), { validate, authenticate });

async function validate(username, password, req, reply) {
    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
        return new Error('Unauthorized');
    }
}

// Static Files (Frontend)
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'frontend/dist'),
    prefix: '/', // optional: default '/'
});

// API Routes
fastify.register(async function (fastify, opts) {

    // Public Data Endpoint (Optional, for now just a placeholder)
    fastify.get('/api/data', async (request, reply) => {
        return { message: 'Public Data', time: new Date().toISOString() };
    });

    // Protected Update Endpoint
    fastify.after(() => {
        fastify.route({
            method: 'POST',
            url: '/api/update',
            onRequest: fastify.basicAuth,
            handler: async (request, reply) => {
                return { status: 'updated', user: request.user }; // request.user is not set by basic-auth automatically in this way, but validation passed
            }
        });
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
