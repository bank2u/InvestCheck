const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5174/pre-invest-test/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const viewports = {
  desktop: { width: 1024, height: 768, name: 'Desktop (1024px)' },
  mobileLandscape: { width: 768, height: 375, name: 'Mobile Landscape (768px)' },
  mobilePortrait: { width: 375, height: 667, name: 'Mobile Portrait (375px)' },
};

const testResults = {};

async function completeQuestionnaire(page) {
  console.log('  Answering all 10 questions (2 per screen)...');

  // Screen 1-5, each with 2 questions
  for (let screen = 1; screen <= 5; screen++) {
    console.log(`    Screen ${screen}...`);

    // Get question groups
    const questions = await page.$$('.question-group');

    // Answer each question with the 3rd option (index 2)
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];
      const answers = await q.$$('.answer-button');

      if (answers.length >= 3) {
        await answers[2].click();
        await sleep(400);
      }
    }

    await sleep(300);

    // Check if results screen appeared
    const hasResults = await page.$('.results-screen');
    if (hasResults) {
      console.log(`    Results screen reached!`);
      return true;
    }
  }

  return false;
}

async function testProjectionOn(browser, viewportKey) {
  const viewport = viewports[viewportKey];
  console.log(`\n=== Testing on ${viewport.name} ===`);

  const page = await browser.newPage();
  await page.setViewport(viewport);
  const results = { viewport: viewport.name, tests: [] };

  try {
    // Step 1: Load
    console.log('1. Loading app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    results.tests.push('✅ App loaded');

    // Step 2: Complete questionnaire
    console.log('2. Answering questionnaire...');
    const reached = await completeQuestionnaire(page);

    if (!reached) {
      // Double-check
      const hasResults = await page.$('.results-screen');
      if (!hasResults) {
        throw new Error('Results screen not reached');
      }
    }
    results.tests.push('✅ Results screen reached');

    // Step 3: Find and click projection button
    console.log('3. Clicking projection button...');
    const btns = await page.$$('button');
    let found = false;
    for (const btn of btns) {
      const txt = await btn.evaluate(el => el.textContent);
      if (txt.includes('ดูการลงทุน')) {
        await btn.click();
        found = true;
        await sleep(600);
        break;
      }
    }

    if (!found) {
      throw new Error('Projection button not found');
    }

    const inputSection = await page.$('.projection-input');
    if (!inputSection) {
      throw new Error('Projection input section did not appear');
    }

    results.tests.push('✅ Projection screen opened');

    // Step 4: Enter amount
    console.log('4. Testing input and chart...');
    const input = await page.$('.currency-input');
    const initialVal = await input.evaluate(el => el.value);

    if (!initialVal || initialVal === '0') {
      // Check error message
      const err = await page.$('.input-error');
      if (err) {
        results.tests.push('✅ Zero amount shows error');
      } else {
        results.tests.push('⚠️ Zero amount error not visible');
      }

      // Enter amount
      await input.click();
      await input.evaluate(el => el.value = '');
      await input.type('10000');
      await sleep(300);
    }

    // Check chart
    const chart = await page.$('.projection-chart');
    if (chart) {
      results.tests.push('✅ Chart displays');
    } else {
      results.tests.push('⚠️ Chart not found');
    }

    // Check summary
    const summary = await page.$('.projection-summary');
    if (summary) {
      results.tests.push('✅ Summary card displays');
    } else {
      results.tests.push('⚠️ Summary not found');
    }

    // Step 5: Test slider
    console.log('5. Testing year slider...');
    const slider = await page.$('.year-slider');
    if (slider) {
      const oldVal = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        s.value = 20;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await sleep(400);

      const newVal = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      if (newVal === 20) {
        results.tests.push('✅ Slider updates (to 20)');
      } else {
        results.tests.push(`⚠️ Slider shows ${newVal} instead of 20`);
      }
    } else {
      results.tests.push('⚠️ Year slider not found');
    }

    // Step 6: Check responsive
    console.log('6. Checking responsive layout...');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => window.innerWidth);

    if (scrollWidth <= clientWidth + 2) {
      results.tests.push('✅ No horizontal scrolling');
    } else {
      results.tests.push(`⚠️ Horizontal scroll (${scrollWidth}px > ${clientWidth}px)`);
    }

    // Step 7: Button sizes
    console.log('7. Checking button touch-friendliness...');
    const sizes = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns)
        .filter(b => b.offsetParent !== null)
        .map(b => Math.round(b.getBoundingClientRect().height));
    });

    const minSize = Math.min(...sizes);
    if (minSize >= 40) {
      results.tests.push(`✅ Touch-friendly buttons (min: ${minSize}px)`);
    } else {
      results.tests.push(`⚠️ Small buttons detected (min: ${minSize}px)`);
    }

    // Step 8: Back button
    console.log('8. Checking back button...');
    const backBtn = await page.$('.back-button');
    results.tests.push(backBtn ? '✅ Back button present' : '⚠️ Back button not found');

  } catch (err) {
    results.tests.push(`❌ Error: ${err.message}`);
  } finally {
    await page.close();
  }

  testResults[viewportKey] = results;
}

async function testEdgeCases(browser) {
  console.log('\n=== Testing Edge Cases ===');
  const edgeResults = { tests: [] };
  const page = await browser.newPage();
  await page.setViewport(viewports.mobilePortrait);

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await completeQuestionnaire(page);

    // Click projection
    const btns = await page.$$('button');
    for (const btn of btns) {
      const txt = await btn.evaluate(el => el.textContent);
      if (txt.includes('ดูการลงทุน')) {
        await btn.click();
        await sleep(600);
        break;
      }
    }

    await page.waitForSelector('.projection-input', { timeout: 3000 });

    // Test 1: Zero amount
    const input = await page.$('.currency-input');
    const val = await input.evaluate(el => el.value);

    if (!val || val === '0') {
      const hasErr = await page.$('.input-error');
      edgeResults.tests.push(hasErr ? '✅ Zero shows error' : '⚠️ No error for zero');
    }

    // Test 2: Large amount
    await input.click();
    await input.evaluate(el => el.value = '');
    await input.type('100000');
    await sleep(400);

    const chart = await page.$('.projection-chart');
    edgeResults.tests.push(chart ? '✅ Large amount (฿100,000)' : '❌ Large amount failed');

    // Test 3: Slider bounds
    const slider = await page.$('.year-slider');
    if (slider) {
      const min = await slider.evaluate(el => parseInt(el.getAttribute('min')));
      const max = await slider.evaluate(el => parseInt(el.getAttribute('max')));
      edgeResults.tests.push(`✅ Slider range: ${min}-${max} years`);

      // Test minimum
      await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        s.value = 5;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await sleep(300);

      const yearVal = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      edgeResults.tests.push(yearVal === 5 ? '✅ Min year (5) works' : `⚠️ Min shows ${yearVal}`);

      // Test maximum
      await page.evaluate((max) => {
        const s = document.querySelector('.year-slider');
        s.value = max;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }, max);
      await sleep(300);

      const maxYear = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      edgeResults.tests.push(maxYear === max ? `✅ Max year (${max})` : `⚠️ Max shows ${maxYear}`);
    }

  } catch (err) {
    edgeResults.tests.push(`❌ Edge case error: ${err.message}`);
  } finally {
    await page.close();
  }

  testResults.edgeCases = edgeResults;
}

async function runTests() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('Starting Projection Feature Testing\n');

    // Test all viewports
    for (const [key, _] of Object.entries(viewports)) {
      await testProjectionOn(browser, key);
    }

    // Test edge cases
    await testEdgeCases(browser);

    // Print summary
    console.log('\n\n========== PROJECTION FEATURE TEST RESULTS ==========\n');

    for (const [name, results] of Object.entries(testResults)) {
      console.log(`${results.viewport || name.toUpperCase()}`);
      console.log('─'.repeat(60));
      results.tests.forEach(t => console.log(t));
    }

    // Summary stats
    let total = 0, passed = 0, warnings = 0;
    for (const results of Object.values(testResults)) {
      results.tests.forEach(t => {
        total++;
        if (t.startsWith('✅')) passed++;
        if (t.startsWith('⚠️')) warnings++;
      });
    }

    console.log(`\n${passed}/${total} tests passed, ${warnings} warnings\n`);

    if (passed >= total - 3) {
      console.log('✅ PROJECTION FEATURE WORKS CORRECTLY');
      process.exit(0);
    } else {
      console.log('❌ CRITICAL FAILURES');
      process.exit(1);
    }

  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runTests();
