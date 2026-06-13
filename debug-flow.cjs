const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function debug() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5174/pre-invest-test/', { waitUntil: 'networkidle2', timeout: 30000 });

  console.log('Starting questionnaire...');

  // Click buttons to progress through the questions
  for (let i = 0; i < 50; i++) {
    const buttons = await page.$$('.answer-button');
    console.log(`\nIteration ${i}: Found ${buttons.length} answer buttons`);

    if (buttons.length === 0) {
      console.log('No more answer buttons found');
      break;
    }

    // Log what the buttons say
    for (let j = 0; j < Math.min(4, buttons.length); j++) {
      const text = await buttons[j].evaluate(el => el.textContent);
      console.log(`  Button ${j}: "${text}"`);
    }

    // Click the third button or the last available
    const buttonToClick = buttons[Math.min(2, buttons.length - 1)];
    const btnText = await buttonToClick.evaluate(el => el.textContent);
    console.log(`  Clicking: "${btnText}"`);
    await buttonToClick.click();
    await sleep(300);

    // Check if results screen appeared
    const resultsScreen = await page.$('.results-screen');
    if (resultsScreen) {
      console.log('\n✅ Results screen found!');
      break;
    }

    // Check current page content
    const pageTitle = await page.evaluate(() => {
      const title = document.querySelector('h2, h1');
      return title ? title.textContent : 'No title found';
    });
    console.log(`  Current title: "${pageTitle}"`);
  }

  // Check final state
  const finalTitle = await page.evaluate(() => {
    const title = document.querySelector('h2, h1');
    return title ? title.textContent : 'No title found';
  });
  console.log(`\n=== Final State ===`);
  console.log(`Title: "${finalTitle}"`);

  const hasResults = await page.$('.results-screen');
  console.log(`Results screen present: ${!!hasResults}`);

  const hasProjection = await page.$('.projection-screen');
  console.log(`Projection screen present: ${!!hasProjection}`);

  // Check all class names on main divs
  const classes = await page.evaluate(() => {
    const app = document.querySelector('.app');
    const children = Array.from(app ? app.children : []).map(el => ({
      tag: el.tagName,
      className: el.className,
    }));
    return children;
  });
  console.log('Children of .app:', JSON.stringify(classes, null, 2));

  await browser.close();
}

debug().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
