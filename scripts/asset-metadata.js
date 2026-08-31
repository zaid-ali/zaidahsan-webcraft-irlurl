// @ts-check

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

/** @param {string} filename @param {number} [maximumBytes] */
async function readHeader(filename, maximumBytes = 1024 * 1024) {
  const handle = await fs.promises.open(filename, "r");
  try {
    const stat = await handle.stat();
    const buffer = Buffer.alloc(Math.min(stat.size, maximumBytes));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/** @param {string} filename */
async function hashFile(filename) {
  const hash = crypto.createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filename);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(undefined));
  });
  return hash.digest("hex");
}

/** @param {Buffer} buffer */
function pngDimensions(buffer) {
  if (
    buffer.length < 24 ||
    buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a"
  )
    return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** @param {Buffer} buffer */
function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer.subarray(0, 2).toString("hex") !== "ffd8")
    return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) break;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    offset += length;
  }

  return null;
}

/** @param {string} filename */
function probeVideo(filename) {
  return new Promise((resolve, reject) => {
    const probe = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "format=duration:stream=codec_name,width,height",
      "-of",
      "json",
      filename,
    ]);

    let stdout = "";
    let stderr = "";
    probe.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    probe.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    probe.on("error", reject);
    probe.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(stderr.trim() || `ffprobe exited with status ${code}`),
        );
        return;
      }

      try {
        const data = JSON.parse(stdout);
        const stream = data.streams?.[0];
        const duration = Number(data.format?.duration);
        if (!stream || !Number.isFinite(duration) || duration <= 0) {
          throw new Error(
            "ffprobe did not return a valid video stream and duration",
          );
        }
        resolve({
          codec: String(stream.codec_name),
          width: Number(stream.width),
          height: Number(stream.height),
          duration: Number(duration.toFixed(3)),
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/** @param {string} reference @param {string} filename */
async function inspectAsset(reference, filename) {
  const stat = await fs.promises.stat(filename);
  const extension = path.extname(reference).toLowerCase();
  const metadata = {
    bytes: stat.size,
    sha256: await hashFile(filename),
  };

  if (extension === ".png" || extension === ".jpg" || extension === ".jpeg") {
    const header = await readHeader(filename);
    const dimensions =
      extension === ".png" ? pngDimensions(header) : jpegDimensions(header);
    if (!dimensions)
      throw new Error(`Unable to read image dimensions for ${reference}`);
    return { ...metadata, ...dimensions };
  }

  if (extension === ".mp4") {
    return { ...metadata, ...(await probeVideo(filename)) };
  }

  return metadata;
}

module.exports = {
  hashFile,
  inspectAsset,
  jpegDimensions,
  pngDimensions,
  probeVideo,
  readHeader,
};
