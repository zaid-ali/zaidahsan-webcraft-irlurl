# irl/URL replica

A self-contained, pixel-faithful replica of the irl/URL agency experience. It includes the WebGL scene, custom typography, scroll choreography, responsive menu, work case studies, team profiles, and local media library.

## Requirements

- Node.js 18 or newer
- A WebGL-capable evergreen browser
- `ffprobe` for media-integrity validation
- Chrome with a CDP endpoint for `npm run test:browser` (port `9222` by default)

The exact development tool versions are locked in `package-lock.json`.

## Commands

```bash
npm install
npm run build
npm start
```

The server defaults to `http://127.0.0.1:5173`. Override it with `HOST` and `PORT`.

Quality commands:

```bash
npm run format:check   # Prettier
npm run lint           # ESLint
npm run typecheck      # TypeScript checkJs
npm test               # Node server/build tests
npm run check:assets   # SHA-256, dimensions, codec, and duration checks
npm run test:browser   # Real-browser WebGL/interaction/accessibility smoke test
npm run verify         # Complete build and validation suite
```

`npm run manifest:update` intentionally updates the committed media hashes and metadata after an approved asset change.

## Technology and architecture

- Semantic HTML5 provides the document, navigation, sections, and accessible overlays.
- Native ES modules in `src/js/` separate scene rendering, navigation, scroll state, text effects, preloading, and case/profile overlays.
- Local structured content in `src/data.json` drives project case studies without a production-site request.
- Three.js is installed from npm and used through its readable ESM distribution for the authored WebGL scene and local GLB models.
- Modular CSS in `src/styles/` separates foundations, preloading, scene presentation, overlays, UI animation, and responsive desktop/mobile rules.
- Native browser APIs provide animation timing, media playback, fetch, service workers, and accessibility behavior; there is no copied production JavaScript bundle.
- `server.js` is a dependency-free Node.js static server with validators, conditional requests, byte ranges, health reporting, and optional structured logs.

The repository never downloads production code or media at runtime. All project images and videos are packaged locally, and unknown files return `404`.

## Asset integrity

`public/asset-manifest.json` records each referenced asset's SHA-256 digest and byte size. Images also record dimensions; MP4 files record dimensions, codec, and duration from `ffprobe`. Validation streams file hashes instead of loading large videos into memory.

The integrity check also rejects external runtime scripts/media and any reintroduced production-origin server fallback.

## Build output

`public/` is the deployable directory. The build recreates the readable HTML, CSS modules, JavaScript modules, service worker, pinned Three.js runtime, fonts, and build metadata while preserving packaged media and data files.

Deploy `public/` behind any static host with byte-range support, or run the included server. `/healthz` returns the active build identifier.

## Testing strategy

- Unit tests cover byte-range edge cases, conditional HTTP requests, caching, MIME behavior, health checks, missing files, and unsupported methods.
- Source-quality tests reject the former production bundle paths, oversized first-party modules, minified first-party JavaScript, external runtime code, and monolithic stylesheet regressions.
- Asset validation verifies exact committed content and decodability metadata.
- The browser smoke test blocks the production origin, waits for WebGL readiness, exercises menu navigation and a case-study overlay, and checks runtime errors, broken media, dialog semantics, and image alternatives.

## Asset provenance

The local media and model assets reproduce the reference art direction and are committed with integrity metadata. The application code is independently authored, modular source; the original site's Webpack runtime and minified application bundle are not included or executed.
