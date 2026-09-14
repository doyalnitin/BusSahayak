const puppeteer = require('/Users/nitindoyal.design/Documents/Codex/2026-05-08/read-my-code-in-the-chrome/swiq-render-ready/node_modules/puppeteer');
const path = require('path');

async function render() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const dir = __dirname;
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(`file://${path.resolve(dir, 'presentation.html')}`, { waitUntil: 'networkidle0', timeout: 60000 });
  
  // Wait for fonts + icons to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 3000));
  
  const slideCount = 9;
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
  
  // Generate PDF with all slides
  await page.evaluate(() => {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => { s.style.display = 'flex'; });
  });
  
  await page.pdf({
    path: path.resolve(dir, 'BusSahayak-Presentation.pdf'),
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  console.log('Generated PDF');
  
  await browser.close();
  console.log('All done!');
}

render().catch(console.error);
