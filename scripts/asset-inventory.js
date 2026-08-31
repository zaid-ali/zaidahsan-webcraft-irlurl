// @ts-check

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const SOURCE_ROOT = path.join(PROJECT_ROOT, "src");
const ASSET_EXTENSION =
  /\.(?:png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|glb|gltf|hdr|woff2?|otf|ttf)$/i;
const TEXT_EXTENSION = /\.(?:css|html|js|json)$/i;

/** @param {string} rawReference */
function normalizeReference(rawReference) {
  if (typeof rawReference !== "string") return null;

  let reference = rawReference.trim().split(/[?#]/, 1)[0];
  if (!reference) return null;

  try {
    reference = decodeURIComponent(reference);
  } catch {
    // Keep a malformed-but-local reference visible to the integrity checker.
  }

  reference = reference.replace(/^\/+/, "");
  if (!reference.startsWith("assets/") || !ASSET_EXTENSION.test(reference))
    return null;

  const resolved = path.resolve(PUBLIC_ROOT, reference);
  if (!resolved.startsWith(`${PUBLIC_ROOT}${path.sep}`)) return null;
  return reference;
}

/**
 * @param {unknown} value
 * @param {(reference: string, source: string) => void} add
 * @param {string} source
 */
function collectStrings(value, add, source) {
  if (typeof value === "string") {
    add(value, source);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, add, source));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, add, source));
  }
}

/** @param {string} root */
function listTextFiles(root) {
  if (!fs.existsSync(root)) return [];

  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const filename = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...listTextFiles(filename));
    else if (entry.isFile() && TEXT_EXTENSION.test(entry.name))
      files.push(filename);
  }
  return files;
}

function collectAssetReferences() {
  /** @type {Map<string, Set<string>>} */
  const references = new Map();
  /** @param {string} rawReference @param {string} source */
  const add = (rawReference, source) => {
    const reference = normalizeReference(rawReference);
    if (!reference) return;
    if (!references.has(reference)) references.set(reference, new Set());
    references.get(reference)?.add(source);
  };

  for (const filename of ["data.json", "site.json"]) {
    const absolutePath = path.join(PUBLIC_ROOT, filename);
    collectStrings(
      JSON.parse(fs.readFileSync(absolutePath, "utf8")),
      add,
      filename,
    );
  }

  const preloadPath = path.join(PUBLIC_ROOT, "preload.json");
  const preload = fs.readFileSync(preloadPath, "utf8");
  const basePath = (/"path"\s*:\s*"([^"]+)"/.exec(preload) || [])[1] || "";
  for (const match of preload.matchAll(/"src"\s*:\s*"([^"]+)"/g)) {
    add(`${basePath}${match[1]}`, "preload.json");
  }

  for (const absolutePath of listTextFiles(SOURCE_ROOT)) {
    const source = path.relative(PROJECT_ROOT, absolutePath);
    const contents = fs.readFileSync(absolutePath, "utf8");
    for (const match of contents.matchAll(
      /(?:^|["'])(\/?assets\/[^"'<>\n\r]+?\.(?:png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|glb|gltf|hdr|woff2?|otf|ttf))/gi,
    )) {
      add(match[1], source);
    }
  }

  return [...references.entries()]
    .map(([reference, sources]) => ({
      reference,
      sources: [...sources].sort(),
    }))
    .sort((left, right) => left.reference.localeCompare(right.reference));
}

/** @param {string} reference */
function expectedKind(reference) {
  const extension = path.extname(reference).toLowerCase();
  if (extension === ".png") return "png";
  if (extension === ".jpg" || extension === ".jpeg") return "jpeg";
  if (extension === ".mp4") return "mp4";
  if (extension === ".glb") return "glb";
  if (extension === ".hdr") return "hdr";
  if (extension === ".svg") return "svg";
  return "other";
}

/** @param {string} reference @param {Buffer} header */
function validateAssetHeader(reference, header) {
  if (!header.length) return "file is empty";

  const kind = expectedKind(reference);
  if (
    kind === "png" &&
    header.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
  ) {
    return "expected a PNG signature";
  }
  if (kind === "jpeg" && header.subarray(0, 3).toString("hex") !== "ffd8ff") {
    return "expected a JPEG signature";
  }
  if (kind === "mp4" && header.subarray(4, 8).toString("ascii") !== "ftyp") {
    return "expected an MP4 ftyp box";
  }
  if (kind === "glb" && header.subarray(0, 4).toString("ascii") !== "glTF") {
    return "expected a GLB signature";
  }
  if (
    kind === "hdr" &&
    !header.subarray(0, 32).toString("ascii").includes("RADIANCE")
  ) {
    return "expected a Radiance HDR header";
  }
  if (
    kind === "svg" &&
    !header.subarray(0, 1024).toString("utf8").includes("<svg")
  ) {
    return "expected SVG markup";
  }

  return null;
}

module.exports = {
  PROJECT_ROOT,
  PUBLIC_ROOT,
  collectAssetReferences,
  normalizeReference,
  validateAssetHeader,
};
