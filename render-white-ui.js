const puppeteer = require('/Users/nitindoyal.design/Documents/Codex/2026-05-08/read-my-code-in-the-chrome/swiq-render-ready/node_modules/puppeteer');
const path = require('path');

async function render() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const dir = __dirname;
  
  // Render white UI mockups
  await page.setViewport({ width: 2400, height: 1000 });
  await page.goto(`file://${path.resolve(dir, 'ui-white.html')}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({
    path: path.resolve(dir, 'assets/ui-white.png'),
    type: 'png',
  });
  console.log('Rendered white UI mockups');
  
  await browser.close();
  console.log('Done!');
}

render().catch(console.error);
