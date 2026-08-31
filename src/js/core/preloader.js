// @ts-check

const CRITICAL_ASSETS = [
  "/assets/models/map.jpg",
  "/assets/models/cubes/L_1_inflated.glb",
  "/assets/models/cubes/R2_Hardware.glb",
];

/** @param {number} progress */
function updateProgress(progress) {
  const indicator = document.querySelector(".preload-progress");
  if (!(indicator instanceof SVGElement)) return;
  const percentage = Math.round(progress * 100);
  indicator.style.strokeDasharray = `${percentage}% ${100 - percentage}%`;
}

/** @param {string} url */
async function warmAsset(url) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Unable to preload ${url}`);
  await response.arrayBuffer();
}

export async function preloadCriticalAssets() {
  window.isLoaded = false;
  const tasks = [document.fonts.ready, ...CRITICAL_ASSETS.map(warmAsset)];
  let completed = 0;

  await Promise.allSettled(
    tasks.map(async (task) => {
      await task;
      completed += 1;
      updateProgress(completed / tasks.length);
    }),
  );

  window.isLoaded = true;
  window.dispatchEvent(new CustomEvent("irlurl:preload-complete"));
}

export async function revealApplication() {
  document.body.classList.add("loaded");
  await new Promise((resolve) => window.setTimeout(resolve, 1_111));
  document.body.classList.add("ready");
  document.body.classList.remove("wait");
  await new Promise((resolve) => window.setTimeout(resolve, 555));
  document.querySelector(".preloader")?.remove();
}
