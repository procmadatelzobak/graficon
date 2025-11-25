# Graficon

Graficon is a dashboard application.

## Project Structure

- `frontend/`: Frontend application (Vite + React/Vue/etc.)
- `server.js`: Backend server (Fastify)
- `public/`: Static files

## Setup

1.  Install dependencies:
    ```bash
    npm install
    cd frontend && npm install
    ```

2.  Create `.env` file in the root directory with necessary environment variables (e.g., `ADMIN_USER`, `ADMIN_PASSWORD`).

3.  Run the server:
    ```bash
    node server.js
    ```
