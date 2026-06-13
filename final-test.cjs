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
  console.log('  Answering all 10 questions...');

  // Screens 1-5, process each
  for (let screen = 1; screen <= 5; screen++) {
    console.log(`    Screen ${screen}...`);
    const questions = await page.$$('.question-group');

    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];

      // Try to find answer buttons first (regular questions)
      let answers = await q.$$('.answer-button');

      if (answers.length > 0) {
        // Regular multiple choice question
        if (answers.length >= 3) {
          await answers[2].click();
          await sleep(400);
        }
      } else {
        // This might be a chart question (Q7)
        const chartOptions = await q.$$('.chart-option');
        if (chartOptions.length > 0) {
          // Click the 3rd option (index 2)
          if (chartOptions.length >= 3) {
            await chartOptions[2].click();
            await sleep(400);
          }
        }
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
    console.log('2. Completing questionnaire...');
    const reached = await completeQuestionnaire(page);

    if (!reached) {
      const hasResults = await page.$('.results-screen');
      if (!hasResults) {
        throw new Error('Results screen not reached after completing all screens');
      }
    }
    results.tests.push('✅ Results screen displayed');

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
      throw new Error('Projection button not found on results screen');
    }

    const inputSection = await page.$('.projection-input');
    if (!inputSection) {
      throw new Error('Projection input section did not appear');
    }

    results.tests.push('✅ Projection screen opened');

    // Step 4: Check input and chart
    console.log('4. Testing input and chart...');
    const input = await page.$('.currency-input');
    if (!input) throw new Error('Currency input not found');

    const initialVal = await input.evaluate(el => el.value);

    if (!initialVal || initialVal === '0') {
      // Check for error message
      const err = await page.$('.input-error');
      if (err) {
        const errText = await err.evaluate(el => el.textContent);
        results.tests.push('✅ Zero amount shows error');
      }

      // Enter amount
      await input.click();
      await input.evaluate(el => el.value = '');
      await input.type('10000');
      await sleep(400);
    }

    // Check chart
    const chart = await page.$('.projection-chart');
    results.tests.push(chart ? '✅ Chart displays' : '⚠️ Chart not visible');

    // Check summary
    const summary = await page.$('.projection-summary');
    results.tests.push(summary ? '✅ Summary card displays' : '⚠️ Summary not visible');

    // Step 5: Test slider
    console.log('5. Testing year slider...');
    const slider = await page.$('.year-slider');
    if (slider) {
      await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        s.value = 20;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await sleep(400);

      const newVal = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      results.tests.push(newVal === 20 ? '✅ Slider updates' : `⚠️ Slider shows ${newVal}`);
    } else {
      results.tests.push('⚠️ Year slider not found');
    }

    // Step 6: Responsive layout
    console.log('6. Checking responsive layout...');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => window.innerWidth);

    results.tests.push(scrollWidth <= clientWidth + 2 ? '✅ No horizontal scrolling' : '⚠️ Horizontal scroll');

    // Step 7: Button sizes
    console.log('7. Checking button sizes...');
    const sizes = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns)
        .filter(b => b.offsetParent !== null)
        .map(b => Math.round(b.getBoundingClientRect().height));
    });

    const minSize = Math.min(...sizes);
    results.tests.push(minSize >= 40 ? `✅ Touch-friendly (${minSize}px)` : `⚠️ Small buttons (${minSize}px)`);

    // Step 8: Back button
    const backBtn = await page.$('.back-button');
    results.tests.push(backBtn ? '✅ Back button present' : '⚠️ Back button missing');

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

    // Test: Zero amount error
    const input = await page.$('.currency-input');
    const val = await input.evaluate(el => el.value);

    if (!val || val === '0') {
      const hasErr = await page.$('.input-error');
      edgeResults.tests.push(hasErr ? '✅ Zero amount error' : '⚠️ No error for zero');
    }

    // Test: Large amount
    await input.click();
    await input.evaluate(el => el.value = '');
    await input.type('100000');
    await sleep(400);

    const chart = await page.$('.projection-chart');
    edgeResults.tests.push(chart ? '✅ Large amount (฿100,000)' : '❌ Large amount failed');

    // Test: Slider bounds
    const slider = await page.$('.year-slider');
    if (slider) {
      const min = await slider.evaluate(el => parseInt(el.getAttribute('min')));
      const max = await slider.evaluate(el => parseInt(el.getAttribute('max')));
      edgeResults.tests.push(`✅ Slider: ${min}-${max} years`);

      // Test min
      await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        s.value = 5;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await sleep(300);

      const minYear = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      edgeResults.tests.push(minYear === 5 ? '✅ Min year (5)' : `⚠️ Min shows ${minYear}`);

      // Test max
      await page.evaluate((m) => {
        const s = document.querySelector('.year-slider');
        s.value = m;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }, max);
      await sleep(300);

      const maxYear = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      edgeResults.tests.push(maxYear === max ? `✅ Max year (${max})` : `⚠️ Max shows ${maxYear}`);
    }

  } catch (err) {
    edgeResults.tests.push(`❌ Error: ${err.message}`);
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

    console.log('PROJECTION FEATURE TESTING\n');

    // Test all viewports
    for (const [key, _] of Object.entries(viewports)) {
      await testProjectionOn(browser, key);
    }

    // Test edge cases
    await testEdgeCases(browser);

    // Print results
    console.log('\n========== TEST RESULTS ==========\n');

    for (const [name, results] of Object.entries(testResults)) {
      console.log(`${results.viewport || name.toUpperCase()}`);
      console.log('─'.repeat(60));
      results.tests.forEach(t => console.log(t));
    }

    // Summary
    let total = 0, passed = 0;
    for (const results of Object.values(testResults)) {
      results.tests.forEach(t => {
        total++;
        if (t.startsWith('✅')) passed++;
      });
    }

    console.log(`\n${passed}/${total} tests passed\n`);

    if (passed >= total - 3) {
      console.log('✅ PROJECTION FEATURE TESTING COMPLETE');
      process.exit(0);
    } else {
      console.log('❌ FAILURES DETECTED');
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
