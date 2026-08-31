// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const stylesRoot = path.resolve(__dirname, "..", "src", "styles");
const entryPath = path.join(stylesRoot, "site.css");
const source = fs.readFileSync(entryPath, "utf8");

if (source.startsWith("@import")) {
  console.log("Styles are already modularized.");
  process.exit(0);
}

/** @param {string} search @param {number} [from] */
function requireIndex(search, from = 0) {
  const index = source.indexOf(search, from);
  if (index < 0) throw new Error(`Unable to locate style boundary: ${search}`);
  return index;
}

/** @param {string} block @param {string[]} labels */
function mediaParts(block, labels) {
  const openingBrace = block.indexOf("{");
  const closingBrace = block.lastIndexOf("}");
  const header = block.slice(0, openingBrace + 1);
  const inner = block.slice(openingBrace + 1, closingBrace);
  const starts = labels.map((label) => {
    const index = inner.indexOf(label);
    if (index < 0) throw new Error(`Unable to locate media boundary: ${label}`);
    return index;
  });
  const boundaries = [0, ...starts, inner.length];
  return boundaries.slice(0, -1).map((start, index) => {
    const chunk = inner.slice(start, boundaries[index + 1]).trim();
    return `${header}\n${chunk}\n}\n`;
  });
}

const preloaderStart = requireIndex("\nbody {\n  background-color");
const foundationStart = requireIndex("\nhtml {", preloaderStart);
const mobileStart = requireIndex("\n@media (max-width: 1100px)");
const motionStart = requireIndex("\n@media (prefers-reduced-motion: reduce)");
const desktopStart = requireIndex("\n@media (min-width: 1101px)");

const mobile = source.slice(mobileStart, motionStart).trim();
const desktop = source.slice(desktopStart).trim();
const mobileParts = mediaParts(mobile, [
  "\n  .case {",
  "\n  .profile {",
  "\n  .dg.ac {",
]);
const desktopParts = mediaParts(desktop, [
  "\n  .case {",
  "\n  .profile {",
  "\n  .dg.ac {",
]);

const modules = new Map([
  ["fonts.css", source.slice(0, preloaderStart).trim() + "\n"],
  [
    "preloader.css",
    source.slice(preloaderStart, foundationStart).trim() + "\n",
  ],
  ["foundation.css", source.slice(foundationStart, mobileStart).trim() + "\n"],
  ["mobile-layout.css", mobileParts[0]],
  ["mobile-case.css", mobileParts[1]],
  ["mobile-profile.css", mobileParts[2]],
  ["mobile-ui.css", mobileParts[3]],
  ["reduced-motion.css", source.slice(motionStart, desktopStart).trim() + "\n"],
  ["desktop-layout.css", desktopParts[0]],
  ["desktop-case.css", desktopParts[1]],
  ["desktop-profile.css", desktopParts[2]],
  ["desktop-ui.css", desktopParts[3]],
]);

for (const [filename, contents] of modules) {
  fs.writeFileSync(path.join(stylesRoot, filename), contents);
}

const imports = [...modules.keys(), "scene.css"]
  .map((filename) => `@import url("./${filename}");`)
  .join("\n");
fs.writeFileSync(
  entryPath,
  `/* Ordered stylesheet modules; keep this entry point intentionally small. */\n${imports}\n`,
);

console.log(`Split site.css into ${modules.size + 1} focused modules.`);
