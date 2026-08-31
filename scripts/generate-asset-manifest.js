// @ts-check

const fs = require("fs");
const path = require("path");
const { PUBLIC_ROOT, collectAssetReferences } = require("./asset-inventory");
const { inspectAsset } = require("./asset-metadata");

async function generateAssetManifest() {
  const references = collectAssetReferences();
  /** @type {Record<string, Record<string, unknown>>} */
  const assets = {};
  let cursor = 0;

  async function worker() {
    while (cursor < references.length) {
      const { reference, sources } = references[cursor++];
      const filename = path.join(PUBLIC_ROOT, reference);
      assets[reference] = {
        ...(await inspectAsset(reference, filename)),
        sources,
      };
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => worker()));
  const orderedAssets = Object.fromEntries(
    Object.entries(assets).sort(([left], [right]) => left.localeCompare(right)),
  );
  const manifest = {
    schemaVersion: 1,
    assets: orderedAssets,
  };

  await fs.promises.writeFile(
    path.join(PUBLIC_ROOT, "asset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

if (require.main === module) {
  generateAssetManifest()
    .then((manifest) => {
      console.log(
        `Wrote metadata for ${Object.keys(manifest.assets).length} assets.`,
      );
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}

module.exports = { generateAssetManifest };
