const puppeteer = require('/Users/nitindoyal.design/Documents/Codex/2026-05-08/read-my-code-in-the-chrome/swiq-render-ready/node_modules/puppeteer');
const path = require('path');

async function render() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const dir = __dirname;
  
  // Render presentation slides
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`file://${path.resolve(dir, 'presentation.html')}`, { waitUntil: 'networkidle0', timeout: 30000 });
  
  const slideCount = 8;
  for (let i = 1; i <= slideCount; i++) {
    await page.evaluate((slideIndex) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((s, idx) => {
        s.style.display = idx === slideIndex - 1 ? 'flex' : 'none';
      });
    }, i);
    
    await page.screenshot({
      path: path.resolve(dir, `assets/slide-${i}.png`),
      type: 'png',
    });
    console.log(`Rendered slide ${i}`);
  }
  
  // Render UI mockups
  await page.setViewport({ width: 2200, height: 950 });
  await page.goto(`file://${path.resolve(dir, 'ui-mockups.html')}`, { waitUntil: 'networkidle0', timeout: 30000 });
  
  await page.screenshot({
    path: path.resolve(dir, 'assets/ui-mockups.png'),
    type: 'png',
    fullPage: false,
  });
  console.log('Rendered UI mockups');
  
  // Render logo
  await page.setViewport({ width: 512, height: 512 });
  await page.setContent(`
    <html>
    <body style="margin:0; padding:0; background:transparent;">
      <svg viewBox="0 0 400 400" width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2563eb"/>
            <stop offset="100%" style="stop-color:#7c3aed"/>
          </linearGradient>
        </defs>
        <circle cx="200" cy="200" r="180" fill="url(#g1)"/>
        <rect x="90" y="130" width="220" height="120" rx="20" fill="white"/>
        <rect x="105" y="145" width="45" height="40" rx="6" fill="#3b82f6"/>
        <rect x="160" y="145" width="45" height="40" rx="6" fill="#3b82f6"/>
        <rect x="215" y="145" width="45" height="40" rx="6" fill="#3b82f6"/>
        <rect x="270" y="145" width="25" height="40" rx="6" fill="#3b82f6"/>
        <circle cx="140" cy="265" r="22" fill="white"/>
        <circle cx="140" cy="265" r="12" fill="#3b82f6"/>
        <circle cx="270" cy="265" r="22" fill="white"/>
        <circle cx="270" cy="265" r="12" fill="#3b82f6"/>
        <path d="M310 170 Q340 190 310 210" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M325 155 Q370 190 325 225" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>
        <path d="M340 140 Q400 190 340 240" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        <rect x="55" y="170" width="16" height="28" rx="8" fill="white"/>
        <path d="M47 200 Q47 218 63 218 Q79 218 79 200" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
        <line x1="63" y1="218" x2="63" y2="232" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <line x1="52" y1="232" x2="74" y2="232" stroke="white" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </body>
    </html>
  `);
  await page.screenshot({
    path: path.resolve(dir, 'assets/logo.png'),
    type: 'png',
    omitBackground: true,
  });
  console.log('Rendered logo');
  
  await browser.close();
  console.log('All done!');
}

render().catch(console.error);
