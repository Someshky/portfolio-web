# Portfolio Investing App — Web

React + Vite + TypeScript PWA for the [portfolio-backend](../portfolio-backend) Spring Boot API.
Installable as a home-screen app on iOS/Android via `vite-plugin-pwa`.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- TanStack Query (server state / caching / mutations)
- react-router-dom
- Firebase Auth (Google + email/password)
- vite-plugin-pwa (manifest + service worker)

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web config
npm run dev
```

`.env.local` needs:

- `VITE_API_BASE_URL` — the backend's URL (`http://localhost:8080` locally, the Render URL once deployed).
- `VITE_FIREBASE_*` — from Firebase Console → Project settings → General → Your apps → Web app.
  These are all safe to expose client-side; they are not secrets.

Without real Firebase config, the login screen degrades to a clear
"Firebase isn't configured yet" message rather than a blank page.

## Build

```bash
npm run build   # tsc -b && vite build, output in dist/
```

## Deploying (Vercel or Netlify)

- Build command: `npm run build`
- Output directory: `dist`
- Env vars: same keys as `.env.local`, set in the platform's dashboard
- After the backend is deployed, set `VITE_API_BASE_URL` to its real URL, and set the backend's
  `CORS_ALLOWED_ORIGINS` env var to this app's real deployed URL.

## Screens

Maps 1:1 to the product spec's 9 screens — see `src/pages/`. Each page's data calls live in
`src/api/*.ts`, one module per backend resource, typed to match `Dtos.java` in the backend.

## Icons

`public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, and
`public/favicon.svg` are placeholder solid-color squares. Replace them with real app icons before
a real deploy — the PWA install prompt and iOS home-screen icon use these directly.
