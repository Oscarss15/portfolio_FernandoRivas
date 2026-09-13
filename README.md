# Fernando Rivas Miranda — Portfolio

Portfolio site for Fernando Rivas Miranda, a cinematographer & colorist. Built with React 19 + Vite.

**Live site:** deployed on [Vercel](https://vercel.com), auto-deploying from this repo's `main` branch.

## Sections

- **Home** — fullscreen looping video background (streamed from Mux), animated title/subtitle, and the main nav menu with hover-preview panels for each section.
- **Information** — bio, specialties, social links, and a rotating photo.
- **Photography** — a paginated "photos on a table" gallery with a click-to-expand rack-focus lightbox.
- **Featured Work** — 5 real video projects, switchable between 4 layouts (grid/stacked/list/carousel), each opening a Mux-powered video player on click.

## Tech stack

- **React 19** + **Vite**
- **Mux** (`@mux/mux-player-react`, `hls.js`) — all video (hero background + Featured Work) streams from Mux, not local files
- Plain CSS per component (no CSS framework) — custom properties in `src/index.css` drive the 3-theme system (light/dark/color)
- `oxlint` for linting

## Commands

```bash
npm install       # install dependencies
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # run oxlint
```

There is no test runner configured in this project.

## Video hosting (Mux)

Video is **not** stored in this repo (`public/videos/` is intentionally empty aside from its own notes) — it's hosted on Mux. To swap or add a video:

1. Upload the file to the Mux dashboard and wait for it to finish processing (`status: ready`).
2. Copy its **Playback ID** — not the Asset ID; they're different values in the same dashboard, and using the Asset ID by mistake causes a `MediaError: invalid playback-id` at runtime.
3. Paste that ID into:
   - `SHOWREEL_MUX_PLAYBACK_ID` in `src/pages/Home/Home.jsx` for the hero background, or
   - the relevant project's `muxPlaybackId` in the `PROJECTS` array in `src/components/FeaturedWork/FeaturedWork.jsx`.

## Deployment

The repo is connected to Vercel (auto-detects Vite, no config needed). Any push to `main` triggers an automatic redeploy — no manual build/upload step.

## Project notes for future work

See [`CLAUDE.md`](./CLAUDE.md) for a detailed history of design decisions, known gotchas, and in-progress/reserved features (kept up to date as the project evolves — read it before making non-trivial changes).
