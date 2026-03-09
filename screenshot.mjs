import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotDir = join(__dirname, 'temporary screenshots');

await mkdir(screenshotDir, { recursive: true });

const [url = 'http://localhost:3000', label] = process.argv.slice(2);

// Auto-increment filename
const files = await readdir(screenshotDir).catch(() => []);
const nums  = files.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1])).filter(n => !isNaN(n));
const n     = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outPath  = join(screenshotDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: undefined, // uses bundled Chromium
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
