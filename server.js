// @ts-check

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const DEFAULT_HOST = process.env.HOST || "127.0.0.1";
const DEFAULT_PORT = Number(process.env.PORT || 5173);
const DEFAULT_PUBLIC_ROOT = path.join(__dirname, "public");

/** @type {Record<string, string>} */
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".hdr": "application/octet-stream",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

/** @param {string} publicRoot @param {string} rawUrl */
function localPathForUrl(publicRoot, rawUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(rawUrl, "http://localhost").pathname);
  } catch {
    return null;
  }

  if (pathname === "/") pathname = "/index.html";
  const candidate = path.resolve(publicRoot, `.${pathname}`);
  if (
    candidate !== publicRoot &&
    !candidate.startsWith(`${publicRoot}${path.sep}`)
  )
    return null;
  return candidate;
}

/** @param {fs.Stats} stat */
function entityTag(stat) {
  return `W/"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`;
}

/** @param {string} filename */
function cacheControl(filename) {
  const relative = path
    .relative(DEFAULT_PUBLIC_ROOT, filename)
    .replaceAll(path.sep, "/");
  if (
    relative === "index.html" ||
    relative === "sw.js" ||
    relative.endsWith(".json")
  ) {
    return "no-cache";
  }
  if (relative.startsWith("assets/"))
    return "public, max-age=31536000, immutable";
  return "public, max-age=0, must-revalidate";
}

/**
 * @param {string} rangeHeader
 * @param {number} size
 * @returns {{ start: number, end: number } | null}
 */
function parseByteRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match || (!match[1] && !match[2]) || size <= 0) return null;

  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null;
    return { start: Math.max(size - suffixLength, 0), end: size - 1 };
  }

  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd))
    return null;
  if (start < 0 || start >= size || requestedEnd < start) return null;
  return { start, end: Math.min(requestedEnd, size - 1) };
}

/** @param {http.IncomingMessage} request @param {string} etag @param {fs.Stats} stat */
function isNotModified(request, etag, stat) {
  if (request.headers["if-none-match"] === etag) return true;
  const ifModifiedSince = request.headers["if-modified-since"];
  if (!ifModifiedSince) return false;
  const since = Date.parse(ifModifiedSince);
  return (
    Number.isFinite(since) &&
    Math.trunc(stat.mtimeMs / 1000) <= Math.trunc(since / 1000)
  );
}

/** @param {http.IncomingMessage} request @param {string} etag @param {fs.Stats} stat */
function rangeAllowed(request, etag, stat) {
  const rawIfRange = request.headers["if-range"];
  const ifRange = Array.isArray(rawIfRange) ? rawIfRange[0] : rawIfRange;
  if (!ifRange) return true;
  if (ifRange === etag) return true;
  const timestamp = Date.parse(ifRange);
  return (
    Number.isFinite(timestamp) &&
    Math.trunc(stat.mtimeMs / 1000) <= Math.trunc(timestamp / 1000)
  );
}

/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {string} filename
 * @param {fs.Stats} stat
 */
function sendLocalFile(request, response, filename, stat) {
  const contentType =
    MIME_TYPES[path.extname(filename).toLowerCase()] ||
    "application/octet-stream";
  const etag = entityTag(stat);
  const lastModified = stat.mtime.toUTCString();

  response.setHeader("Accept-Ranges", "bytes");
  response.setHeader("Cache-Control", cacheControl(filename));
  response.setHeader("Content-Type", contentType);
  response.setHeader("ETag", etag);
  response.setHeader("Last-Modified", lastModified);
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (isNotModified(request, etag, stat)) {
    response.writeHead(304);
    response.end();
    return;
  }

  const requestedRange = request.headers.range;
  const range =
    requestedRange && rangeAllowed(request, etag, stat)
      ? parseByteRange(requestedRange, stat.size)
      : null;

  if (requestedRange && rangeAllowed(request, etag, stat) && !range) {
    response.writeHead(416, { "Content-Range": `bytes */${stat.size}` });
    response.end();
    return;
  }

  if (range) {
    response.writeHead(206, {
      "Content-Length": range.end - range.start + 1,
      "Content-Range": `bytes ${range.start}-${range.end}/${stat.size}`,
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filename, range).pipe(response);
    return;
  }

  response.writeHead(200, { "Content-Length": stat.size });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  fs.createReadStream(filename).pipe(response);
}

/** @param {string} publicRoot */
function readBuildVersion(publicRoot) {
  try {
    const metadata = JSON.parse(
      fs.readFileSync(path.join(publicRoot, "build-meta.json"), "utf8"),
    );
    return String(metadata.version || "unknown");
  } catch {
    return "unknown";
  }
}

/** @param {string} publicRoot */
function validateStartup(publicRoot) {
  for (const relativePath of [
    "index.html",
    "asset-manifest.json",
    "build-meta.json",
  ]) {
    if (!fs.existsSync(path.join(publicRoot, relativePath))) {
      throw new Error(
        `Missing required build output: ${relativePath}. Run npm run build.`,
      );
    }
  }
}

/**
 * @param {{ publicRoot?: string, logRequests?: boolean }} [options]
 */
function createServer(options = {}) {
  const publicRoot = path.resolve(options.publicRoot || DEFAULT_PUBLIC_ROOT);
  const buildVersion = readBuildVersion(publicRoot);
  const logRequests = options.logRequests ?? process.env.LOG_REQUESTS === "1";

  return http.createServer((request, response) => {
    const startedAt = Date.now();
    const requestId = crypto.randomUUID();
    response.setHeader("X-Request-Id", requestId);

    response.on("finish", () => {
      if (!logRequests) return;
      console.log(
        JSON.stringify({
          requestId,
          method: request.method,
          url: request.url,
          status: response.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    });

    if (!["GET", "HEAD"].includes(request.method || "")) {
      response.writeHead(405, {
        Allow: "GET, HEAD",
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Method not allowed");
      return;
    }

    if (
      new URL(request.url || "/", "http://localhost").pathname === "/healthz"
    ) {
      const body = JSON.stringify({ status: "ok", build: buildVersion });
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": Buffer.byteLength(body),
        "Content-Type": "application/json; charset=utf-8",
      });
      response.end(request.method === "HEAD" ? undefined : body);
      return;
    }

    const filename = localPathForUrl(publicRoot, request.url || "/");
    if (!filename) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Invalid path");
      return;
    }

    fs.stat(filename, (error, stat) => {
      if (!error && stat.isFile()) {
        sendLocalFile(request, response, filename, stat);
        return;
      }

      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    });
  });
}

if (require.main === module) {
  validateStartup(DEFAULT_PUBLIC_ROOT);
  const server = createServer();
  server.listen(DEFAULT_PORT, DEFAULT_HOST, () => {
    console.log(
      `irl/URL replica running at http://${DEFAULT_HOST}:${DEFAULT_PORT}`,
    );
  });

  function shutdown() {
    server.close(() => process.exit(0));
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = {
  cacheControl,
  createServer,
  entityTag,
  localPathForUrl,
  parseByteRange,
  validateStartup,
};
