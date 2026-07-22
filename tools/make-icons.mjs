// Renders icons/ from tools/icon.html with headless Chrome.
// Run only when the brand mark changes:  node tools/make-icons.mjs
//
// Deliberately NOT wired into `node --test`: PNG bytes depend on the installed
// Chrome's rasteriser and would churn across browser updates. The icons are
// committed build products, regenerated on purpose.
//
// Unlike the GRE copy this needs no font inlining — the mark is pure geometry.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Chrome renders each size natively rather than downsampling one big raster:
// these are vector marks, so native rasterisation is crisp at every size and
// keeps the tool dependency-free.
const TARGETS = [
  ["icons/icon-512.png", 512],
  ["icons/icon-192.png", 192],
  ["icons/apple-touch-icon.png", 180],
];

const CHROMES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CHROMES.find((p) => existsSync(p));
if (!chrome) {
  console.error("Chrome not found. Set CHROME=/path/to/chrome and re-run.");
  process.exit(1);
}

const src = pathToFileURL(join(ROOT, "tools/icon.html")).href;

// Chrome refuses to open a window narrower than ~500px and silently clamps to
// that width, while still writing the PNG at the size you asked for — so
// --window-size=192,192 yields a 192px image containing a CROPPED corner of a
// 500px render, with no error. Always render at a 512 window (above the clamp)
// and let the device scale factor produce the final size. Chrome rasterises
// the vector at deviceScaleFactor x CSS pixels, so this is still a true render
// at each size, not a downsample of a bitmap.
const RENDER_PX = 512;

for (const [out, size] of TARGETS) {
  execFileSync(
    chrome,
    [
      "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
      `--force-device-scale-factor=${size / RENDER_PX}`,
      "--virtual-time-budget=5000",
      `--screenshot=${join(ROOT, out)}`,
      `--window-size=${RENDER_PX},${RENDER_PX}`,
      src,
    ],
    { stdio: "ignore" },
  );
  console.log(`${out}  ${size}x${size}`);
}
