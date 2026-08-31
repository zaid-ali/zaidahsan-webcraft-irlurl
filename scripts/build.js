// @ts-check

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  PROJECT_ROOT,
  PUBLIC_ROOT,
  collectAssetReferences,
} = require("./asset-inventory");

const SOURCE_ROOT = path.join(PROJECT_ROOT, "src");
const THREE_ROOT = path.join(PROJECT_ROOT, "node_modules", "three");

/** @param {string} source @param {string} destination */
async function copyDirectory(source, destination) {
  await fs.promises.mkdir(destination, { recursive: true });
  for (const entry of await fs.promises.readdir(source, {
    withFileTypes: true,
  })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyDirectory(sourcePath, destinationPath);
    else if (entry.isFile())
      await fs.promises.copyFile(sourcePath, destinationPath);
  }
}

async function copyThreeRuntime() {
  const destination = path.join(PUBLIC_ROOT, "vendor", "three");
  await fs.promises.mkdir(
    path.join(destination, "examples", "jsm", "loaders"),
    { recursive: true },
  );
  await fs.promises.mkdir(path.join(destination, "examples", "jsm", "math"), {
    recursive: true,
  });
  await Promise.all([
    fs.promises.copyFile(
      path.join(THREE_ROOT, "build", "three.module.js"),
      path.join(destination, "three.module.js"),
    ),
    fs.promises.copyFile(
      path.join(THREE_ROOT, "examples", "jsm", "loaders", "GLTFLoader.js"),
      path.join(destination, "examples", "jsm", "loaders", "GLTFLoader.js"),
    ),
    fs.promises.copyFile(
      path.join(THREE_ROOT, "examples", "jsm", "loaders", "RGBELoader.js"),
      path.join(destination, "examples", "jsm", "loaders", "RGBELoader.js"),
    ),
    fs.promises.copyFile(
      path.join(THREE_ROOT, "examples", "jsm", "math", "ImprovedNoise.js"),
      path.join(destination, "examples", "jsm", "math", "ImprovedNoise.js"),
    ),
    fs.promises.copyFile(
      path.join(THREE_ROOT, "LICENSE"),
      path.join(destination, "LICENSE"),
    ),
  ]);
}

/** @param {string[]} filenames */
async function buildVersion(filenames) {
  const hash = crypto.createHash("sha256");
  for (const filename of filenames.sort()) {
    hash.update(path.relative(PROJECT_ROOT, filename));
    hash.update(await fs.promises.readFile(filename));
  }
  return hash.digest("hex").slice(0, 16);
}

/** @param {string} root @returns {string[]} */
function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(filename) : [filename];
  });
}

async function build() {
  for (const generatedPath of ["js", "styles", "vendor"]) {
    await fs.promises.rm(path.join(PUBLIC_ROOT, generatedPath), {
      recursive: true,
      force: true,
    });
  }

  await Promise.all([
    fs.promises.copyFile(
      path.join(SOURCE_ROOT, "index.html"),
      path.join(PUBLIC_ROOT, "index.html"),
    ),
    fs.promises.copyFile(
      path.join(SOURCE_ROOT, "data.json"),
      path.join(PUBLIC_ROOT, "data.json"),
    ),
    copyDirectory(path.join(SOURCE_ROOT, "js"), path.join(PUBLIC_ROOT, "js")),
    copyDirectory(
      path.join(SOURCE_ROOT, "styles"),
      path.join(PUBLIC_ROOT, "styles"),
    ),
    copyDirectory(
      path.join(SOURCE_ROOT, "assets"),
      path.join(PUBLIC_ROOT, "assets"),
    ),
    copyThreeRuntime(),
  ]);

  const threeRuntimeFiles = [
    path.join(THREE_ROOT, "build", "three.module.js"),
    path.join(THREE_ROOT, "examples", "jsm", "loaders", "GLTFLoader.js"),
    path.join(THREE_ROOT, "examples", "jsm", "loaders", "RGBELoader.js"),
    path.join(THREE_ROOT, "examples", "jsm", "math", "ImprovedNoise.js"),
  ];
  const buildInputs = [...listFiles(SOURCE_ROOT), ...threeRuntimeFiles];
  const version = await buildVersion(buildInputs);
  const sourceRuntimeUrls = [
    ...listFiles(path.join(SOURCE_ROOT, "js")),
    ...listFiles(path.join(SOURCE_ROOT, "styles")),
  ].map((filename) => `/${path.relative(SOURCE_ROOT, filename)}`);
  const precacheUrls = [
    "/",
    "/index.html",
    ...sourceRuntimeUrls,
    "/vendor/three/three.module.js",
    "/vendor/three/examples/jsm/loaders/GLTFLoader.js",
    "/vendor/three/examples/jsm/loaders/RGBELoader.js",
    "/vendor/three/examples/jsm/math/ImprovedNoise.js",
    "/data.json",
    "/preload.json",
    "/site.json",
    "/favicon.png",
    ...collectAssetReferences()
      .map(({ reference }) => reference)
      .filter(
        (reference) =>
          reference.startsWith("assets/icons/") ||
          reference.startsWith("assets/fonts/") ||
          reference.startsWith("assets/models/") ||
          reference === "assets/icons.svg",
      )
      .map((reference) => `/${reference}`),
  ];

  const serviceWorkerTemplate = await fs.promises.readFile(
    path.join(SOURCE_ROOT, "service-worker.js"),
    "utf8",
  );
  const serviceWorker = serviceWorkerTemplate
    .replace("__CACHE_VERSION__", version)
    .replace(
      "__PRECACHE_URLS__",
      JSON.stringify([...new Set(precacheUrls)].sort(), null, 2),
    );
  await fs.promises.writeFile(path.join(PUBLIC_ROOT, "sw.js"), serviceWorker);
  await fs.promises.writeFile(
    path.join(PUBLIC_ROOT, "build-meta.json"),
    `${JSON.stringify({ version, sourceFiles: buildInputs.length }, null, 2)}\n`,
  );

  console.log(`Built readable application shell ${version}.`);
}

if (require.main === module) {
  build().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}

module.exports = { build };
