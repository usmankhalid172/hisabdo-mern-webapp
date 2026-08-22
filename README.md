# HisabDo MERN

Next.js frontend with an Express, MongoDB and Mongoose API.

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and a bcrypt `ADMIN_PASSWORD_HASH`.
2. Install dependencies with `npm install`.
3. Start the API with `npm run api` (port `4000`).
4. Start the frontend with `npm run dev` (port `3000`).

The API deliberately starts without MongoDB when `MONGODB_URI` is absent, so `/api/health` and auth configuration can be smoke-tested. Database-backed endpoints return `503` until MongoDB is configured.

## API contract

- `GET /api/health`
- `POST /api/admin/login`
- `POST /api/contact`
- `GET /api/contact` and `PATCH|DELETE /api/contact/:id` (admin)
- `GET /api/jobs`, `GET /api/jobs/:slug`, `POST /api/jobs`, `PUT|DELETE /api/jobs/:id` (admin mutations)
- `POST /api/jobs/:slug/applications`, `GET /api/jobs/:id/applications` (admin read)
- `GET /api/blog`, `GET /api/blog/:slug`, `POST /api/blog`, `PUT|DELETE /api/blog/:id` (admin mutations)

Admin mutations require `Authorization: Bearer <token>` from the login endpoint. Request bodies are validated with Zod and all API errors use `{ "error": "..." }`, with validation details included when applicable.

## Verification

Run `npm test` for schema validation tests and `npm run build` for the Next production build.