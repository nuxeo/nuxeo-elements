#!/usr/bin/env node
/**
 * Ensures the bundled Puppeteer Chromium is installed, installing it only when missing.
 *
 * `web-test-runner` drives a Puppeteer-provided Chromium. Every test entry point (`npm test` and
 * each per-package `test:<pkg>` script) declares a `pretest*` hook so a standalone run works on a
 * fresh checkout, but a full `npm test` would otherwise trigger the installer several times. This
 * guard makes the repeat invocations cheap no-ops: it installs once, then short-circuits.
 *
 * Usage: node scripts/test/unit/ensure-chromium.js
 */
const fs = require('fs');
const { execSync } = require('child_process');

async function isChromiumInstalled() {
  try {
    const puppeteer = require('puppeteer');
    // puppeteer 25 changed executablePath() to return a Promise<string>; await handles both
    // that and the older synchronous string return, so the guard resolves a real path either way.
    const executablePath = await puppeteer.executablePath();
    return Boolean(executablePath) && fs.existsSync(executablePath);
  } catch (_) {
    return false;
  }
}

(async () => {
  if (await isChromiumInstalled()) {
    console.log('[ensure-chromium] Chromium already installed — skipping install.');
    process.exit(0);
  }

  console.log('[ensure-chromium] Installing Puppeteer Chromium…');
  // Use npx so the puppeteer CLI resolves whether or not node_modules/.bin is on PATH
  // (e.g. when this script is invoked directly via `node` rather than through an npm script).
  execSync('npx --no-install puppeteer browsers install chrome', { stdio: 'inherit' });
})();
