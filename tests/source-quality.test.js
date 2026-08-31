// @ts-check

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");

/** @param {string} relativePath */
function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

/** @param {string} relativeDirectory @returns {string[]} */
function listFiles(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  return fs
    .readdirSync(absoluteDirectory, { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = path.join(relativeDirectory, entry.name);
      return entry.isDirectory() ? listFiles(relativePath) : [relativePath];
    });
}

test("runtime resources are local and analytics-free", () => {
  const html = read("public/index.html");
  const content = read("public/data.json");
  assert.doesNotMatch(
    html,
    /googletagmanager|google-analytics|code\.createjs\.com/,
  );
  assert.doesNotMatch(
    html,
    /<(?:script|img|video|audio|source)[^>]+src=["']https?:\/\//i,
  );
  assert.match(html, /type="module" src="\/js\/main\.js\?v=[^"]+"/);
  assert.match(html, /\/vendor\/three\/three\.module\.js/);
  assert.doesNotMatch(html, /irlurl-engine|preloadjs|webpackChunk/);
  assert.doesNotMatch(html, /https?:\/\/(?:www\.)?irl-?url\.com/i);
  assert.doesNotMatch(content, /https?:\/\//i);
  assert.match(html, /id="nike"/);
  assert.doesNotMatch(html, /id="lqd"/);
  assert.deepEqual(
    JSON.parse(content).pages.map(
      (/** @type {{ id: string }} */ page) => page.id,
    ),
    ["nike", "akatsuki", "drew", "beast", "pink", "dead"],
  );
});

test("frontend code and styles are readable modular source", () => {
  const html = read("public/index.html");
  const cssEntry = read("public/styles/site.css");
  const sourceModules = listFiles(path.join("src", "js")).filter((filename) =>
    filename.endsWith(".js"),
  );
  const styleModules = fs
    .readdirSync(path.join(root, "src", "styles"))
    .filter((filename) => filename.endsWith(".css"));

  assert(html.split("\n").length > 500);
  assert(styleModules.length >= 10);
  assert.match(cssEntry, /@import url\("\.\/mobile-layout\.css"\)/);
  assert.match(cssEntry, /@import url\("\.\/desktop-layout\.css"\)/);
  assert.doesNotMatch(cssEntry, /data:font\/[^;]+;base64/);
  assert(sourceModules.length >= 8);
  for (const filename of sourceModules) {
    const source = read(filename);
    assert(source.split("\n").length < 350, `${filename} is too large`);
    assert(
      source.split("\n").every((line) => line.length < 500),
      `${filename} contains a likely minified line`,
    );
  }
  assert.equal(
    fs.existsSync(path.join(root, "vendor", "irlurl-engine")),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(root, "public", "vendor", "irlurl-engine")),
    false,
  );
});

test("service worker has a versioned shell and runtime strategy", () => {
  const worker = read("public/sw.js");
  assert.doesNotMatch(worker, /__CACHE_VERSION__|__PRECACHE_URLS__/);
  assert.match(worker, /const CACHE_PREFIX = "irlurl-replica"/);
  assert.match(
    worker,
    /const SHELL_CACHE = `\$\{CACHE_PREFIX\}-shell-\$\{CACHE_VERSION\}`/,
  );
  assert.match(worker, /cache\.addAll\(PRECACHE_URLS\)/);
  assert.match(worker, /request\.mode === "navigate"/);
});

test("build metadata and hashed asset manifest are present", () => {
  const build = JSON.parse(read("public/build-meta.json"));
  const manifest = JSON.parse(read("public/asset-manifest.json"));
  assert.match(build.version, /^[a-f0-9]{16}$/);
  assert(Object.keys(manifest.assets).length >= 160);
  for (const asset of Object.values(manifest.assets)) {
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    assert(asset.bytes > 0);
  }
});
