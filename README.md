# Result Portal Admin Dashboard

Administrative React + Vite dashboard for managing students, results, tokens, payments, notifications, settings, and analytics.

## Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS via `@tailwindcss/vite`
- Axios
- Socket.IO client

## Local Development

```bash
npm install
npm run dev
```

The development server runs on `http://localhost:5173` and proxies API requests to `http://localhost:5002`.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production build.
- `npm run preview` previews the production build locally.
- `npm run lint` runs ESLint.

## Routing

- The application is built with a base path of `/admin/`.
- When hosted behind the shared Express server, the app is available at `http://localhost:5002/admin`.

## Environment Variables

Copy `.env.example` to `.env` for deployment-specific overrides.

```env
VITE_API_BASE_URL=/api
```

## Deployment

- Recommended host: Vercel
- Build command: `npm run build`
- Output directory: `dist`
- A `vercel.json` file is included so SPA routing and `/admin` asset paths resolve correctly.

## Notes

- Do not commit `.env`, `dist`, or logs.
- This repository is intended to be pushed independently as `resultportal-admin`.
