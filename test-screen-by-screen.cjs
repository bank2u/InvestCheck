const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5174/pre-invest-test/', { waitUntil: 'networkidle2', timeout: 30000 });

  console.log('Screen-by-screen test:\n');

  // Screen 1
  console.log('=== SCREEN 1 ===');
  let questions = await page.$$('.question-group');
  console.log(`Questions on screen: ${questions.length}`);

  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const text = await q.evaluate(el => el.querySelector('.question-text').textContent);
    const answers = await q.$$('.answer-button');
    console.log(`Q${qIdx + 1}: "${text.substring(0, 40)}..." - ${answers.length} answers`);

    if (answers.length >= 3) {
      await answers[2].click();
      await sleep(300);
    }
  }

  await sleep(500);
  console.log('\nAfter Screen 1:');
  let progress = await page.evaluate(() => document.querySelector('.progress-text').textContent);
  console.log(`Progress: ${progress}`);
  questions = await page.$$('.question-group');
  console.log(`Questions on screen: ${questions.length}`);

  // Screen 2
  console.log('\n=== SCREEN 2 ===');
  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const text = await q.evaluate(el => el.querySelector('.question-text').textContent);
    const answers = await q.$$('.answer-button');
    console.log(`Q${qIdx + 1}: "${text.substring(0, 40)}..." - ${answers.length} answers`);

    if (answers.length >= 3) {
      await answers[2].click();
      await sleep(300);
    }
  }

  await sleep(500);
  console.log('\nAfter Screen 2:');
  progress = await page.evaluate(() => document.querySelector('.progress-text').textContent);
  console.log(`Progress: ${progress}`);
  questions = await page.$$('.question-group');
  console.log(`Questions on screen: ${questions.length}`);

  // Screen 3
  console.log('\n=== SCREEN 3 ===');
  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const text = await q.evaluate(el => el.querySelector('.question-text').textContent);
    const answers = await q.$$('.answer-button');
    const isChart = await q.evaluate(el => el.querySelector('.chart-buttons') !== null);
    console.log(`Q${qIdx + 1}: "${text.substring(0, 40)}..." - ${answers.length} answers${isChart ? ' (CHART)' : ''}`);

    if (answers.length >= 3) {
      await answers[2].click();
      await sleep(300);
    }
  }

  await sleep(500);
  console.log('\nAfter Screen 3:');
  progress = await page.evaluate(() => document.querySelector('.progress-text').textContent);
  console.log(`Progress: ${progress}`);
  questions = await page.$$('.question-group');
  console.log(`Questions on screen: ${questions.length}`);

  // Screen 4
  console.log('\n=== SCREEN 4 ===');
  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const text = await q.evaluate(el => el.querySelector('.question-text').textContent);
    const answers = await q.$$('.answer-button');
    console.log(`Q${qIdx + 1}: "${text.substring(0, 40)}..." - ${answers.length} answers`);

    if (answers.length >= 3) {
      await answers[2].click();
      await sleep(300);
    }
  }

  await sleep(500);
  console.log('\nAfter Screen 4:');
  progress = await page.evaluate(() => document.querySelector('.progress-text').textContent);
  console.log(`Progress: ${progress}`);
  questions = await page.$$('.question-group');
  console.log(`Questions on screen: ${questions.length}`);

  // Screen 5
  console.log('\n=== SCREEN 5 ===');
  for (let qIdx = 0; qIdx < questions.length; qIdx++) {
    const q = questions[qIdx];
    const text = await q.evaluate(el => el.querySelector('.question-text').textContent);
    const answers = await q.$$('.answer-button');
    console.log(`Q${qIdx + 1}: "${text.substring(0, 40)}..." - ${answers.length} answers`);

    if (answers.length >= 3) {
      await answers[2].click();
      await sleep(300);
    }
  }

  await sleep(500);
  console.log('\nAfter Screen 5:');
  const resultsScreen = await page.$('.results-screen');
  const questionScreen = await page.$('.question-screen');
  console.log(`Results screen visible: ${!!resultsScreen}`);
  console.log(`Question screen visible: ${!!questionScreen}`);

  if (!resultsScreen) {
    const html = await page.evaluate(() => document.querySelector('.app').className);
    console.log(`App classes: ${html}`);
  }

  await browser.close();
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
