const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1200 });

  // UI Mockups
  const uiPath = 'file://' + path.resolve(__dirname, 'ui-white.html');
  await page.goto(uiPath, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({
    path: path.resolve(__dirname, 'assets/ui-mockups-full.png'),
    fullPage: true,
    type: 'png'
  });
  console.log('UI mockups saved');

  // Architecture
  const archPath = 'file://' + path.resolve(__dirname, 'architecture-diagrams.html');
  await page.goto(archPath, { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({
    path: path.resolve(__dirname, 'assets/architecture-full.png'),
    fullPage: true,
    type: 'png'
  });
  console.log('Architecture saved');

  await browser.close();
  console.log('Done!');
})();
