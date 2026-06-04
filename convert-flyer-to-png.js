const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertFlyer() {
  const htmlFile = path.join(__dirname, 'a5-flyer-v5.html');
  const outputFile = path.join(__dirname, 'a5-flyer-v5.png');

  console.log('📄 Reading HTML file...');
  const htmlContent = fs.readFileSync(htmlFile, 'utf-8');

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // A5 size: 420px × 595px (at 72dpi)
    await page.setViewport({
      width: 420,
      height: 595,
      deviceScaleFactor: 1,
    });

    console.log('📝 Loading HTML content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    console.log(`📸 Taking screenshot and saving to ${outputFile}...`);
    await page.screenshot({
      path: outputFile,
      omitBackground: false,
      type: 'png',
    });

    console.log(`✅ Successfully converted to PNG: ${outputFile}`);
    console.log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
  } finally {
    await browser.close();
  }
}

convertFlyer().catch(err => {
  console.error('❌ Conversion failed:', err);
  process.exit(1);
});
