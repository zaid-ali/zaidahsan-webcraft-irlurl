# Frontend architecture

## Ownership boundary

All application behavior is maintained as readable first-party source under `src/`. Three.js is the only browser runtime dependency and is installed from npm at a pinned version. Static content and media live in `public/` and are locked by `asset-manifest.json`.

No JavaScript or stylesheet bundle from the reference deployment is included in the build. Reference media remains local so the authored scene can retain the intended art direction without a production-origin dependency.

## Load sequence

1. `site.css` imports the focused CSS modules in deterministic cascade order.
2. `main.js` starts native preloading, the Three.js scene, section state, navigation, and overlays.
3. `scene/` owns model loading, camera transitions, video textures, and rendering.
4. `ui/` owns scroll navigation, text effects, menus, case studies, and profiles.
5. `app.js` adds dialog semantics, focus management, keyboard behavior, and image alternatives.
6. The service worker installs a versioned local app shell and caches larger case-study media as it is visited.

## Module map

- `src/js/core/` — small shared utilities and preloading.
- `src/js/scene/` — readable Three.js scene modules.
- `src/js/ui/` — DOM interaction and content-rendering modules.
- `src/styles/` — foundation, scene, overlay, UI, and breakpoint-specific styles.
- `src/data.json` — locally packaged team and case-study content.

## Release process

1. Modify readable source or approved static media.
2. Run `npm run manifest:update` only when asset bytes intentionally change.
3. Run `npm run verify`.
4. Inspect desktop, tablet, and mobile reference captures for any intended visual change.
5. Deploy the contents of `public/`.
