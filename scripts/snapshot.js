// scripts/snapshot.js
// Render and snapshot https://m.site.naver.com/1OsuE with Puppeteer, strip heavy scripts, rewrite links.

const fs = require('fs');
const path = require('path');
const mkdirp = p => fs.mkdirSync(p, { recursive: true });

const TARGET = "https://m.site.naver.com/1OsuE";
const OUT_DIR = path.join(process.cwd(), 'snapshot');
const OUT_FILE = path.join(OUT_DIR, 'index.html');

(async () => {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36');
  await page.setRequestInterception(true);

  // Block analytics/ads for speed
  const blocked = [/googletagmanager|google-analytics|doubleclick|adservice|naverad/i];
  page.on('request', req => {
    const url = req.url();
    if (blocked.some(rx => rx.test(url)) && (req.resourceType() === 'script' || req.resourceType() === 'image')) {
      return req.abort();
    }
    req.continue();
  });

  await page.goto(TARGET, { waitUntil: 'networkidle2', timeout: 120000 });

  // Inline cleanup in the DOM context
  const html = await page.evaluate(() => {
    // Remove heavy scripts
    for (const s of Array.from(document.scripts)) s.remove();
    // Remove noscript duplicates
    for (const n of Array.from(document.querySelectorAll('noscript'))) n.remove();

    // Convert relative links to absolute
    const toAbs = (u) => { try { return new URL(u, location.href).toString(); } catch(e) { return u; } };
    for (const a of Array.from(document.querySelectorAll('a[href]'))) a.setAttribute('href', toAbs(a.getAttribute('href')));
    for (const img of Array.from(document.images)) img.setAttribute('src', toAbs(img.getAttribute('src')));
    for (const link of Array.from(document.querySelectorAll('link[href]'))) link.setAttribute('href', toAbs(link.getAttribute('href')));
    for (const s of Array.from(document.querySelectorAll('script[src]'))) s.setAttribute('src', toAbs(s.getAttribute('src')));

    // Basic style to ensure readability after script removal
    const style = document.createElement('style');
    style.textContent = 'body{font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Apple SD Gothic Neo,Noto Sans KR,sans-serif} a{color:#2563EB}';
    document.head.appendChild(style);

    return '<!doctype html>\n' + document.documentElement.outerHTML;
  });

  await browser.close();

  mkdirp(OUT_DIR);
  require('fs').writeFileSync(OUT_FILE, html, 'utf-8');
  console.log('Saved snapshot to', OUT_FILE);
})().catch(err => { console.error(err); process.exit(1); });
