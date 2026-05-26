# Workout Tracker

A personal PWA for logging gym workouts. Build Routines of Exercises, then start Sessions to record Sets in real time. All data lives on-device in IndexedDB — no account, no server.

## Features

- Create Routines with Exercises (weighted, bodyweight, or timed)
- Start a Session from any Routine — previous Set values are carried forward as defaults
- One active Session at a time; complete or abandon before starting another
- Installable as a PWA on iOS and Android

## Tech stack

- [Vite](https://vitejs.dev) + [React 19](https://react.dev) + TypeScript
- [Zustand](https://zustand-demo.pmnd.rs) for state
- [idb](https://github.com/jakearchibald/idb) + IndexedDB for persistence
- [Zod](https://zod.dev) for runtime schema validation
- [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app) for PWA support

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## License

MIT — see [LICENSE](./LICENSE).
