const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function quickTest() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5174/pre-invest-test/', { waitUntil: 'networkidle2', timeout: 30000 });

  console.log('Starting quick test...\n');

  // Get the question groups
  const questions = await page.$$('.question-group');
  console.log(`Found ${questions.length} question groups on screen 1`);

  // For each question group, click the 3rd answer button (index 2)
  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const questionText = await q.evaluate(el => el.querySelector('.question-text').textContent);
    console.log(`\nQuestion ${qIdx + 1}: "${questionText.substring(0, 40)}..."`);

    // Get answer buttons for this question
    const answers = await q.$$('.answer-button');
    console.log(`  Found ${answers.length} answer buttons`);

    if (answers.length >= 3) {
      const btnText = await answers[2].evaluate(el => el.textContent);
      console.log(`  Clicking button 3: "${btnText}"`);
      await answers[2].click();
      await sleep(500);
    }
  }

  // Check the new state
  await sleep(500);
  const newQuestions = await page.$$('.question-group');
  const currentProgress = await page.evaluate(() => {
    const p = document.querySelector('.progress-text');
    return p ? p.textContent : 'unknown';
  });

  console.log(`\nAfter answering: ${currentProgress}`);
  console.log(`Question groups on screen: ${newQuestions.length}`);

  // Check if we moved to next screen
  const hasResults = await page.$('.results-screen');
  console.log(`Results screen visible: ${!!hasResults}`);

  await browser.close();
}

quickTest().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
