const puppeteer = require('puppeteer');

async function inspectDOM() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5174/pre-invest-test/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Inspect the initial DOM
  console.log('=== Initial DOM Structure ===');
  const structure = await page.evaluate(() => {
    const root = document.querySelector('#root');
    if (!root) return 'No #root element found';

    // Find all top-level elements
    const children = Array.from(root.children).map(el => ({
      tag: el.tagName,
      className: el.className,
      id: el.id,
      textContent: el.textContent.substring(0, 100),
    }));

    return children;
  });

  console.log(JSON.stringify(structure, null, 2));

  // Check for question inputs
  console.log('\n=== Question Inputs ===');
  const inputs = await page.evaluate(() => {
    const all = document.querySelectorAll('input[type="radio"], input[type="checkbox"], input[name]');
    return Array.from(all).slice(0, 20).map(el => ({
      type: el.type,
      name: el.name,
      value: el.value,
      id: el.id,
    }));
  });

  console.log(JSON.stringify(inputs, null, 2));

  // Check for buttons
  console.log('\n=== Buttons ===');
  const buttons = await page.evaluate(() => {
    const all = document.querySelectorAll('button');
    return Array.from(all).map(el => ({
      text: el.textContent,
      className: el.className,
    }));
  });

  console.log(JSON.stringify(buttons, null, 2));

  await browser.close();
}

inspectDOM().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
