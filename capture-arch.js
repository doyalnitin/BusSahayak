const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  const filePath = 'file://' + path.resolve(__dirname, 'architecture-diagrams.html');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // Full page PDF
  await page.pdf({
    path: path.resolve(__dirname, 'BusSahayak-Architecture.pdf'),
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  });
  console.log('PDF saved: BusSahayak-Architecture.pdf');

  // Full page screenshot
  await page.screenshot({
    path: path.resolve(__dirname, 'assets/architecture-full.png'),
    fullPage: true,
    type: 'png'
  });
  console.log('Full screenshot saved');

  // Individual section screenshots
  const sections = [
    'arch-1-techstack',
    'arch-2-core',
    'arch-3-voiceflow',
    'arch-4-comparison',
    'arch-5-ner',
    'arch-6-stats',
    'arch-7-security'
  ];

  const sectionEls = await page.$$('.section');
  for (let i = 0; i < sectionEls.length && i < sections.length; i++) {
    try {
      await sectionEls[i].screenshot({
        path: path.resolve(__dirname, 'assets/' + sections[i] + '.png'),
        type: 'png'
      });
      console.log('Saved: ' + sections[i] + '.png');
    } catch(e) {
      console.log('Skip: ' + sections[i]);
    }
  }

  await browser.close();
  console.log('Done!');
})();
