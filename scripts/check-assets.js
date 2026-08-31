// @ts-check

const fs = require("fs");
const path = require("path");
const {
  PROJECT_ROOT,
  PUBLIC_ROOT,
  collectAssetReferences,
  validateAssetHeader,
} = require("./asset-inventory");
const { inspectAsset, readHeader } = require("./asset-metadata");

function findRuntimeExternalResources() {
  const html = fs.readFileSync(path.join(PUBLIC_ROOT, "index.html"), "utf8");
  const failures = [];

  for (const match of html.matchAll(
    /<(?:script|img|video|audio|source)\b[^>]*\bsrc=["'](https?:\/\/[^"']+)/gi,
  )) {
    failures.push(`index.html: external runtime resource ${match[1]}`);
  }
  for (const match of html.matchAll(
    /<link\b[^>]*\brel=["'](?:stylesheet|preload|modulepreload)["'][^>]*\bhref=["'](https?:\/\/[^"']+)/gi,
  )) {
    failures.push(`index.html: external runtime resource ${match[1]}`);
  }

  for (const filename of [
    "server.js",
    "src/index.html",
    "src/data.json",
    "src/js/app.js",
    "src/js/main.js",
    "src/js/core/preloader.js",
    "src/js/scene/config.js",
    "src/js/scene/model-loader.js",
    "src/js/scene/video-block.js",
    "src/js/scene/visual-scene.js",
    "src/js/ui/navigation.js",
    "src/js/ui/overlays.js",
    "src/js/ui/section-controller.js",
    "src/js/ui/text-effects.js",
  ]) {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");
    if (
      /https?:\/\/(?:www\.)?irl-?url\.com|UPSTREAM_HOST|upstream-cache|X-Replica-Source/.test(
        source,
      )
    ) {
      failures.push(`${filename}: production-origin fallback is present`);
    }
  }

  return failures;
}

async function main() {
  const references = collectAssetReferences();
  const manifestPath = path.join(PUBLIC_ROOT, "asset-manifest.json");
  const failures = [];

  if (!fs.existsSync(manifestPath)) {
    failures.push("asset-manifest.json: missing; run npm run manifest:update");
  }

  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : { assets: {} };
  const expectedReferences = new Set(
    references.map(({ reference }) => reference),
  );
  const manifestReferences = new Set(Object.keys(manifest.assets || {}));

  for (const reference of expectedReferences) {
    if (!manifestReferences.has(reference))
      failures.push(`${reference}: absent from asset-manifest.json`);
  }
  for (const reference of manifestReferences) {
    if (!expectedReferences.has(reference))
      failures.push(`${reference}: stale asset-manifest.json entry`);
  }

  let cursor = 0;
  async function worker() {
    while (cursor < references.length) {
      const { reference, sources } = references[cursor++];
      const filename = path.join(PUBLIC_ROOT, reference);

      if (!fs.existsSync(filename)) {
        failures.push(
          `${reference}: missing (referenced by ${sources.join(", ")})`,
        );
        continue;
      }

      const headerError = validateAssetHeader(
        reference,
        await readHeader(filename),
      );
      if (headerError) {
        failures.push(`${reference}: ${headerError}`);
        continue;
      }

      const expected = manifest.assets?.[reference];
      if (!expected) continue;
      const actual = await inspectAsset(reference, filename);

      if (actual.bytes !== expected.bytes)
        failures.push(`${reference}: byte size changed`);
      if (actual.sha256 !== expected.sha256)
        failures.push(`${reference}: SHA-256 changed`);
      if ("width" in expected && actual.width !== expected.width)
        failures.push(`${reference}: width changed`);
      if ("height" in expected && actual.height !== expected.height)
        failures.push(`${reference}: height changed`);
      if (
        "duration" in expected &&
        Math.abs(actual.duration - expected.duration) > 0.01
      ) {
        failures.push(`${reference}: video duration changed`);
      }
      if ("codec" in expected && actual.codec !== expected.codec)
        failures.push(`${reference}: video codec changed`);
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => worker()));
  failures.push(...findRuntimeExternalResources());

  const contentMediaCount = references.filter(
    ({ reference }) =>
      !reference.startsWith("assets/icons/") &&
      /\.(?:png|jpe?g|gif|webp|avif|mp4|webm|mov)$/i.test(reference),
  ).length;
  const iconCount = references.filter(({ reference }) =>
    reference.startsWith("assets/icons/"),
  ).length;
  const sceneAssetCount = references.length - contentMediaCount - iconCount;

  if (failures.length) {
    console.error(
      `Asset integrity check failed with ${failures.length} problem(s):`,
    );
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(
    `Asset integrity check passed: ${references.length} hashed and decoded local assets ` +
      `(${contentMediaCount} content media, ${iconCount} icons, ${sceneAssetCount} WebGL/SVG assets).`,
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
