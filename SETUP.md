# irl/URL Agency — Webcraft Replica — Setup

## Quick Run (under 5 minutes)

Prerequisites:

- Node.js `>=18` (tested on `18.x` and `20.x`). Uses native `fs`, `http`, `crypto` and ESM modules.
- `npm` `9+` or `10+`. No external DB, no secrets required for basic run.
- Optional `ffprobe` for `npm run check:assets` media validation.

Steps:

```bash
# 1. Install dependencies (eslint, prettier, typescript types, three via vendor)
npm install

# 2. Build readable HTML/CSS/JS + generated manifests into public/
npm run build

# 3. Start static server (default host 127.0.0.1, port 5173)
npm start
# or
npm run dev

# Open http://127.0.0.1:5173
# Health check at http://127.0.0.1:5173/healthz returns {"status":"ok","build":"..."}

# Optional: override host/port
HOST=127.0.0.1 PORT=4173 npm start
```

Quality gates:

```bash
npm run check            # build + format:check + lint + typecheck + test + check:assets
npm run verify           # check + browser smoke

npm test                 # node --test server + source-quality tests
npm run lint
npm run format:check
npm run typecheck        # tsc checkJs
npm run check:assets     # SHA-256, dimensions, codec, duration verification via ffprobe
npm run test:browser     # requires Chrome CDP at http://127.0.0.1:9222
```

## Project Structure

- `server.js` — dependency-free static server, serves `public/` with mime, ETag, conditional requests `If-None-Match`/`If-Modified-Since`, single byte ranges with `If-Range`, immutable caching for `/assets/`, no-cache for `index.html`/`sw.js`/`.json`, `/healthz` returns build version from `build-meta.json`.
- `src/index.html` — semantic document structure: header with logo `72x50` SVG sprite, menu trigger `40x40`, slogan `We don't do basic`, `nav#site-navigation`, `main#main` with 9 sections `intro`, `work`, `services`, `about`, `mission`, `purpose`, `vision`, `team`, `outro`, indicator `.indicator ul` + label div, preloader `.preloader` with progress circle + `93x108` logo, scroll-target `1400vh`, overlays `.case` and `.profile` with close buttons.
- `src/data.json` — local team array 4 items (`travis`, `bree`, `frank`, `damian`) with name, styled `[Tra]vis`, title, bio long, image, video, logos; pages array 6 items (`nike`, `akatsuki`, `drew`, `beast`, `pink`, `dead`) each with cover url/title/subtitle, intro scope comma list plus p1/p2, rows of columns 1/2/3 with content type image/video/text.
- `src/js/` — `main.js` entry loads content `/data.json`, decorates animated text, starts VisualScene, SectionController, navigation, overlays, preloads critical glbs and fonts, reveals app.
  - `core/preloader.js` — warms `/assets/models/map.jpg`, `L_1_inflated.glb`, `R2_Hardware.glb` plus font ready, updates `.preload-progress` strokeDasharray percent, sets `window.isLoaded`.
  - `scene/` — `visual-scene.js` owns Three.js scene, camera FOV nudge, model loading `model-loader.js`, environment HDR `empty_warehouse_01_1k.hdr`, post-process `post-processor.js`, scene-objects `scene-objects.js`, video-block `video-block.js` for hovering preview textures, device-profile for mobile camera.
  - `ui/navigation.js` — logo click to index 0, menuTrigger toggle `menu-on` plus scene dim, nav links with data-target jump.
  - `ui/section-controller.js` — builds indicator dots from `main section h3`, tracks scrollY/max, computes scaledProgress `scrollY/max * sections.length`, index floor, sectionProgress fraction, toggles section classes `up`/`on`/`out`, wrapper class active id, indicator li `up`/`on`/`down` plus inner span scaleX, dispatches `change` after 111ms and `settled` after 3666ms, loops when reaching max or top <1, handles resize, goTo index * max/sections.length +1.
  - `ui/overlays.js` — binds work/team hover preview `playWorkVideo`/`playTeamVideo`, click openCase/openProfile rendering sections `cover`, `desc`, `col1/2/3` with variants `flush`, `narrow-wide`, etc., waits images then ready, close after 450ms.
  - `ui/text-effects.js` — decorates `anim-words`/`anim-letters` off states and reveals on settled.
  - `app.js` — dialog semantics, focus management, keyboard, alt enrichment.
  - `register-service-worker.js` — registers service worker.
- `src/styles/` — `site.css` imports ordered: `fonts.css`, `preloader.css`, `foundation.css`, `mobile-layout.css`, `mobile-case.css`, `mobile-profile.css`, `mobile-ui.css`, `reduced-motion.css`, `desktop-layout.css`, `desktop-case.css`, `desktop-profile.css`, `desktop-ui.css`, `scene.css`. Fonts.css declares `pixel.otf`, `sans.ttf`, `serif.ttf`.
- `src/service-worker.js` — versioned app-shell precache plus runtime caching for larger case media.
- `vendor/three/` and `vendor/irlurl-engine/` and `vendor/createjs/` — local copies of dependencies.
- `public/assets/` — local fonts, icons SVG sprite `#logo`, apple/favicons, team images/videos/logos, work images/videos, pages `beast`, `dead`, `nike`, `pink`, models `Logo.glb` + cubes `L_*` `R_*` + HDR + map, videos `akatsuki.mp4` etc. Total 190 assets verified via manifest.
- `public/` also contains `index.html` built output, `styles/`, `js/`, `vendor/`, `data.json`, `site.json` manifest, `asset-manifest.json` with SHA-256 and dimensions, `build-meta.json` with version hash, `sw.js`.
- `scripts/build.js` — deterministic build recreating HTML/CSS/JS/service worker/vendor/fonts and build metadata while preserving packaged media.

## External Assets Used

- **Images:** all local in `public/assets/images/` and `public/assets/pages/` and `public/assets/icons/`:
  - Work general `akatsuki-cover.jpg`, `akatsuki-1.jpg` … `akatsuki-17.jpg`, `drew-cover.jpg`, `drew-1.jpg` … `drew-15.jpg`, `lqd-cover.jpg` etc.
  - Pages beast `cover.png`, `MrBeast-13.png`, `MrBeastxNaruto-1.png` … `11.png`, pink `Coastal-Classics.png`, `Wings.png`, swim variants, dead collection overview and product stills and Tokyo pop-up, nike `Cover.webp`, `Guide-Hoodie.webp`, `Footballverse.webp` etc.
  - Icons `apple-touch-icon-144x144.png`, `favicon-32x32.png`, `irlurl-192.png`, `thumbnail.jpg` `960x640`.
  - Team portraits `team/travis.jpg`, `bree.jpg`, `frank.jpg`, `damian.jpg` plus logo sheets.
  - No remote image hotlinking.

- **Videos:** local `mp4` `h264` under `public/assets/images/work/`, `public/assets/pages/beast/`, `dead/`, `nike/`, `pink/`, `public/assets/videos/`:
  - Work preview `akatsuki.mp4`, `drew.mp4`.
  - Team portrait `travis.mp4` `1080x1168` durations `12.9`–`16.1s`, `bree.mp4`, `frank.mp4`, `damian.mp4`.
  - Case videos `MrBeast-Swag-drop.mp4`, `MrBeastxShaquille-oneal.mp4`, `collab.mp4`, `Deadmau5xCatEyedBoy-Pop-Up-Tokyo.mp4`, `Nike-RTFKT-AR-Hoodie.mp4`, `Pink-Palm-Puff-Disney-Little-Mermaid.mp4`, `akatsuki-1.mp4`, `drew-1.mp4` etc.
  - All with controls for case, autoplay muted loop for team.

- **3D models:** local GLB + HDR + JPG under `public/assets/models/`:
  - `Logo.glb`, cubes `L_1_inflated.glb`, `L_3_suzanne2.glb`, `L_4_art cube.glb`, `L_5_rubicks.glb`, `L_6_Sci-Fi.glb`, `L_8_liquid plastic.glb`, `R2_Hardware.glb`, `R_1_liquid metallic.glb`, `R_5_inflated.glb`, `R_6_Speaker.glb`, `R_7_minecraft.glb`, `R_8_concret.glb`, HDR `empty_warehouse_01_1k.hdr`, map `map.jpg`.

- **Fonts:** local `woff`? Actually `otf`/`ttf` kept as original per May 2025 guidance: `pixel.otf`, `sans.ttf`, `serif.ttf` under `/assets/fonts/`.

- **Icons / SVGs:** local sprite `/assets/icons.svg` containing logo symbol, plus individual png icons, plus inline SVGs for burger and close X graphics and animated slash logo `93x108`.

- **No outbound analytics, no Google Fonts remote, no production origin hotlinking at runtime.**

## What Was AI-Generated vs Sourced

- **Sourced from original (kept as approved per Webcraft guidance):** brand copy headings, tagline `We don't do basic`, intro paragraphs, work titles and uppercase descriptors, services numbered list plus tailored line, about/mission/purpose/vision paragraphs, team names/titles/bios, client logo sheets, contact email and address and social URLs, images AVIF/JPG/PNG/WebP originals, videos MP4 originals, models GLB originals, fonts OTF/TTF originals, favicons and manifest and thumbnail, Mobiquity credit.

- **AI-generated / reconstructed for replica:** server `server.js` with conditional requests and ranges, build pipeline `scripts/build.js` deterministic output to `public/`, readable page shell `src/index.html`, modular stylesheet reconstruction from inspection (not copying production CSS bundle), `src/js/core/` utilities and preloader recovery, `src/js/scene/` visual scene modules re-implementing camera choreography and cube arrangement and video preview mapping, `src/js/ui/` navigation and scroll controller and overlays and text effects, service worker versioned precache, asset manifest generation and integrity checks.

- **Per May 2025 guidance, original images, videos, models and fonts kept as original local assets, no transformation required.**

## Replication Notes

- **Single route scroll choreography:** original uses fixed `100vh` sections with scroll track driving progression and looping top↔bottom. We preserved fixed section mechanic with indicators, wrapper identity reflecting active chapter, `111ms` camera change delay and `3666ms` content settled timing, hover descriptor `BUILDING THE PRODUCT ENGINE...` appearing with fade+slide `0.6s cubic-bezier(0.215,0.61,0.355,1)` and video preview via scene.

- **Menu:** circular trigger `42px` home? Actually `40x40` burger with fragmented bars, toggle dimming main, full-screen nav overlay with Work/Services/About/Team links mapped to scroll indices `1,2,3,7`, contact and social and credit `Website by Mobiquity`.

- **Work overlay fidelity:** cover figure full width title `MrBeast` etc subtitle uppercase descriptor, intro split About copy plus Scope list comma-split trimmed, media rows `col1`/`col2`/`col3` variants `flush`, `narrow-wide`, `nospace`, `no-item-padding`, `uneven`, `uneven-video`, `uneven-image` for rhythm, images alt `Project visual`, videos controls.

- **Team overlay:** left top name `h1` `Travis Anderson` etc title `President` bio exact, bottom `Selected clients` plus logo sheet alt containing name, right video poster matching portrait autoplay muted loop inline.

- **Preloader:** progress circle strokeDasharray driven by percent of critical assets `map.jpg`, `L_1_inflated.glb`, `R2_Hardware.glb` plus fonts ready, body states `wait`/`loaded`/`ready` and removal after ~`1.6s`.

- **WebGL field:** background canvas behind main with environment HDR `empty_warehouse_01_1k.hdr` and cubes, pointer/hover video mapping, FOV nudge on scroll direction, pause on visibility hidden.

- **Accessibility:** focus-visible outline `2px solid` offset `4px`, aria-controls/expanded for menu trigger, aria-hidden toggling for nav, aria-label for indicator dots and close buttons `Close case study`/`Close team profile`, hidden spans for logos.

- **Asset integrity:** `asset-manifest.json` stores SHA-256, bytes, dimensions, codec, duration via `ffprobe`, validation streams hashes not full memory buffering.

## Environment Variables

- `.env.example` — currently none required for basic run, placeholder for future.
- Runtime flags supported by server:
  - `HOST` default `127.0.0.1`
  - `PORT` default `5173`
  - `LOG_REQUESTS=1` enables structured JSON request logs.

## Production Build & Deployment

```bash
# Build for production (emits public/ as deployable)
npm run build

# Start production server
npm start

# Or one-liner dev
npm run dev
```

Deployment to Vercel (private — current template for Webcraft):

1. Ensure `public/` built and not gitignored for deploy? Actually Vercel builds via `npm run build` outputting `public/`.
2. `npx vercel --prod` or connect GitHub repo to Vercel project, output directory `public/`.
3. Configure firewall (required): Vercel Dashboard → Project → Settings → Firewall → Add Rule `internal meta` If IP is not any of `163.114.128.0/20` and `199.201.64.0/22` Then Deny. Publish.
4. If blocked by institution policy, use `bunnylol appvote` to unblock 24h.
5. After deploy, update `site.toml` url with live URL, set `hosting=vercel`, and transfer ownership: Vercel Dashboard Settings → General → Transfer Project → select `AAI - Web Craft` team, then set `hosting_access_granted=true` in `site.toml` and commit.
6. If push after transfer errors `Project deleted, transferred...`, reconnect GitHub import under new team scope: switch top-left team to `AAI - Web Craft`, find project → Git → Connect to Codimango repo.

## Narration / Walkthrough Videos

Primary narrated walkthrough (human voice, time-aligned cause-effect, covers every chapter: welcome, work list with hover descriptors and background preview video, services grid, about, mission, purpose, vision, team list with hover titles, outro contact, menu open/close via trigger, navigation jumps Work/Services/About/Team, indicator dots hover label and click jump, case overlays for MrBeast/Pink Palm Puff/Deadmau5/Nike x RTFKT/Akatsuki/Drew House with cover/intro/scope/media rows/scroll/close, profile overlays for Travis Anderson/Bree Morrison/Frank van Rooijen/Damian Estrada with video/bio/logos, preloader progress, WebGL stage cube choreography, scroll looping top↔bottom, responsive behavior at 1440/768/390, keyboard tab through logo/menu/work/team/close/social/email, focus-visible outlines, reduced-motion fallback, asset verification):

- https://pxl.cl/cMP14

Format: MP4/MOV H.264 1080p 24-30fps, single browser window capture, mic + optional desktop audio.
