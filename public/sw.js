// The build replaces both placeholders below with deterministic values.
const CACHE_VERSION = "53b5f11f95dba782";
const PRECACHE_URLS = [
  "/",
  "/assets/fonts/pixel.otf",
  "/assets/fonts/sans.ttf",
  "/assets/fonts/serif.ttf",
  "/assets/icons.svg",
  "/assets/icons/apple-touch-icon-144x144.png",
  "/assets/icons/apple-touch-icon-152x152.png",
  "/assets/icons/favicon-16x16.png",
  "/assets/icons/favicon-32x32.png",
  "/assets/icons/irlurl-192.png",
  "/assets/icons/irlurl-384.png",
  "/assets/icons/irlurl-512.png",
  "/assets/icons/irlurl-thumbnail.jpg",
  "/assets/icons/mstile-144x144.png",
  "/assets/models/Logo.glb",
  "/assets/models/cubes/L_1_inflated.glb",
  "/assets/models/cubes/L_3_suzanne2.glb",
  "/assets/models/cubes/L_4_art cube.glb",
  "/assets/models/cubes/L_5_rubicks.glb",
  "/assets/models/cubes/L_6_Sci-Fi.glb",
  "/assets/models/cubes/L_8_liquid plastic.glb",
  "/assets/models/cubes/R2_Hardware.glb",
  "/assets/models/cubes/R_1_liquid metallic.glb",
  "/assets/models/cubes/R_5_inflated.glb",
  "/assets/models/cubes/R_6_Speaker.glb",
  "/assets/models/cubes/R_7_minecraft.glb",
  "/assets/models/cubes/R_8_concret.glb",
  "/assets/models/hdr/empty_warehouse_01_1k.hdr",
  "/assets/models/map.jpg",
  "/data.json",
  "/favicon.png",
  "/index.html",
  "/js/app.js",
  "/js/core/math.js",
  "/js/core/preloader.js",
  "/js/main.js",
  "/js/register-service-worker.js",
  "/js/scene/config.js",
  "/js/scene/device-profile.js",
  "/js/scene/environment.js",
  "/js/scene/model-loader.js",
  "/js/scene/post-processor.js",
  "/js/scene/scene-objects.js",
  "/js/scene/video-block.js",
  "/js/scene/visual-scene.js",
  "/js/ui/navigation.js",
  "/js/ui/overlays.js",
  "/js/ui/section-controller.js",
  "/js/ui/text-effects.js",
  "/preload.json",
  "/site.json",
  "/styles/desktop-case.css",
  "/styles/desktop-layout.css",
  "/styles/desktop-profile.css",
  "/styles/desktop-ui.css",
  "/styles/fonts.css",
  "/styles/foundation.css",
  "/styles/mobile-case.css",
  "/styles/mobile-layout.css",
  "/styles/mobile-profile.css",
  "/styles/mobile-ui.css",
  "/styles/preloader.css",
  "/styles/reduced-motion.css",
  "/styles/scene.css",
  "/styles/site.css",
  "/vendor/three/examples/jsm/loaders/GLTFLoader.js",
  "/vendor/three/examples/jsm/loaders/RGBELoader.js",
  "/vendor/three/examples/jsm/math/ImprovedNoise.js",
  "/vendor/three/three.module.js"
];

const CACHE_PREFIX = "irlurl-replica";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== SHELL_CACHE &&
                key !== RUNTIME_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) ?? (await caches.match("/index.html"));
  }
}

async function assetResponse(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function currentSourceResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }

  const mutableSource =
    url.pathname.startsWith("/js/") ||
    url.pathname.startsWith("/styles/") ||
    url.pathname.endsWith(".json");
  if (mutableSource) {
    event.respondWith(currentSourceResponse(request));
    return;
  }

  event.respondWith(assetResponse(request));
});
