// @ts-check

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { after, before, test } = require("node:test");
const { createServer, parseByteRange } = require("../server");

const publicRoot = path.resolve(__dirname, "..", "public");
const server = createServer({ publicRoot });
let port = 0;

before(async () => {
  await new Promise((resolve) =>
    server.listen({ port: 0, host: "127.0.0.1" }, () => resolve(undefined)),
  );
  const address = server.address();
  assert(address && typeof address === "object");
  port = address.port;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve(undefined))),
  );
});

/**
 * @param {string} pathname
 * @param {{ method?: string, headers?: Record<string, string> }} [options]
 */
function request(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port,
        path: pathname,
        method: options.method || "GET",
        headers: options.headers,
      },
      (response) => {
        /** @type {Buffer[]} */
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({ response, body: Buffer.concat(chunks) }),
        );
      },
    );
    request.on("error", reject);
    request.end();
  });
}

test("byte-range parser supports bounded, open-ended, and suffix ranges", () => {
  assert.deepEqual(parseByteRange("bytes=2-5", 10), { start: 2, end: 5 });
  assert.deepEqual(parseByteRange("bytes=4-", 10), { start: 4, end: 9 });
  assert.deepEqual(parseByteRange("bytes=-3", 10), { start: 7, end: 9 });
  assert.deepEqual(parseByteRange("bytes=-20", 10), { start: 0, end: 9 });
  assert.equal(parseByteRange("bytes=-0", 10), null);
  assert.equal(parseByteRange("bytes=10-12", 10), null);
  assert.equal(parseByteRange("bytes=0-1,4-5", 10), null);
});

test("serves the readable application shell with validators", async () => {
  const { response, body } = await request("/");
  assert.equal(response.statusCode, 200);
  assert.match(String(response.headers["content-type"]), /^text\/html/);
  assert.equal(response.headers["cache-control"], "no-cache");
  assert(response.headers.etag);
  assert(response.headers["last-modified"]);
  assert.match(body.toString(), /type="module" src="\/js\/main\.js\?v=[^"]+"/);

  const conditional = await request("/", {
    headers: { "If-None-Match": String(response.headers.etag) },
  });
  assert.equal(conditional.response.statusCode, 304);
  assert.equal(conditional.body.length, 0);
});

test("HEAD returns metadata without a response body", async () => {
  const { response, body } = await request("/styles/site.css", {
    method: "HEAD",
  });
  assert.equal(response.statusCode, 200);
  assert.equal(body.length, 0);
  assert.equal(response.headers["content-type"], "text/css; charset=utf-8");
});

test("suffix ranges return the final requested bytes", async () => {
  const relativePath = "favicon.png";
  const source = fs.readFileSync(path.join(publicRoot, relativePath));
  const { response, body } = await request(`/${relativePath}`, {
    headers: { Range: "bytes=-10" },
  });

  assert.equal(response.statusCode, 206);
  assert.equal(
    response.headers["content-range"],
    `bytes ${source.length - 10}-${source.length - 1}/${source.length}`,
  );
  assert.deepEqual(body, source.subarray(-10));
});

test("rejects malformed or unsatisfiable ranges", async () => {
  for (const range of ["bytes=999999999-", "bytes=0-1,4-5", "bytes=-0"]) {
    const { response } = await request("/favicon.png", {
      headers: { Range: range },
    });
    assert.equal(response.statusCode, 416);
  }
});

test("uses immutable caching for packaged assets", async () => {
  const { response } = await request("/assets/icons/favicon-32x32.png", {
    method: "HEAD",
  });
  assert.equal(response.statusCode, 200);
  assert.equal(
    response.headers["cache-control"],
    "public, max-age=31536000, immutable",
  );
});

test("exposes health and rejects unsupported routes and methods", async () => {
  const health = await request("/healthz");
  assert.equal(health.response.statusCode, 200);
  assert.equal(JSON.parse(health.body.toString()).status, "ok");

  assert.equal((await request("/missing-file.png")).response.statusCode, 404);
  assert.equal(
    (await request("/", { method: "POST" })).response.statusCode,
    405,
  );
});
