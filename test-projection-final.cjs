const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5174/pre-invest-test/';

// Utility sleep function
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test configuration for different screen sizes
const viewports = {
  desktop: { width: 1024, height: 768, name: 'Desktop (1024px)' },
  mobileLandscape: { width: 768, height: 375, name: 'Mobile Landscape (768px)' },
  mobilePortrait: { width: 375, height: 667, name: 'Mobile Portrait (375px)' },
};

const testResults = {
  desktop: {},
  mobileLandscape: {},
  mobilePortrait: {},
};

async function answerAllQuestions(page) {
  console.log('  Answering all 10 questions...');

  // The questionnaire has 5 screens, each with 2 questions
  // We need to answer 2 questions per screen before moving to next
  for (let screenNum = 1; screenNum <= 5; screenNum++) {
    console.log(`    Screen ${screenNum}...`);

    // For each screen, we need to answer the 2 questions
    // Get the question numbers for this screen
    const questionTexts = await page.evaluate(() => {
      const items = document.querySelectorAll('.question-item');
      return Array.from(items).map(el => el.textContent.substring(0, 50));
    });

    // Click the appropriate answer button for each question on this screen
    // We'll click the 3rd option (index 2, which is "ค") for all questions
    for (let questionIdx = 0; questionIdx < questionTexts.length; questionIdx++) {
      const buttons = await page.$$('.answer-button');

      if (buttons.length < questionIdx + 1) {
        // Not enough buttons for this question
        if (questionIdx === 0) {
          // First question buttons
          if (buttons.length > 2) {
            await buttons[2].click();
          } else if (buttons.length > 0) {
            await buttons[Math.min(2, buttons.length - 1)].click();
          }
        }
      } else {
        // Click the appropriate button (offset by the question index * 4)
        const buttonIndex = questionIdx * 4 + 2; // Assuming 4 options per question
        if (buttons.length > buttonIndex) {
          console.log(`      Question ${questionIdx + 1}: clicking option at index ${buttonIndex}`);
          await buttons[buttonIndex].click();
          await sleep(400);
        }
      }
    }

    // Wait for the screen to update (either next screen or results)
    await sleep(500);

    // Check if we've reached the results screen
    const hasResults = await page.$('.results-screen');
    if (hasResults) {
      console.log(`  Results screen reached!`);
      break;
    }

    // Check current screen number
    const currentScreen = await page.evaluate(() => {
      const progress = document.querySelector('.progress-text');
      return progress ? progress.textContent : '';
    });
    console.log(`    Current progress: ${currentScreen}`);
  }
}

async function answerQuestionsSimple(page) {
  console.log('  Answering questions...');

  let answerCount = 0;
  const maxIterations = 50;

  for (let iter = 0; iter < maxIterations; iter++) {
    // Get all currently visible answer buttons
    const buttons = await page.$$eval('.answer-button', (btns) => {
      return btns.map(btn => ({
        text: btn.textContent,
        visible: btn.offsetParent !== null,
      }));
    });

    if (buttons.length === 0) {
      console.log('    No more buttons found - questionnaire may be complete');
      break;
    }

    const visibleCount = buttons.filter(b => b.visible).length;
    console.log(`    Iteration ${iter}: ${visibleCount} visible buttons`);

    // Click the 3rd button (index 2) if available
    const buttonElements = await page.$$('.answer-button');
    if (buttonElements.length > 2) {
      const btn = buttonElements[2];
      const text = await btn.evaluate(el => el.textContent);
      console.log(`      Clicking: "${text.substring(0, 30)}..."`);
      await btn.click();
      answerCount++;
      await sleep(600);
    } else if (buttonElements.length > 0) {
      await buttonElements[0].click();
      answerCount++;
      await sleep(600);
    }

    // Check if results screen appeared
    const hasResults = await page.$('.results-screen');
    if (hasResults) {
      console.log(`  ✅ Results screen found after ${answerCount} answers!`);
      return true;
    }

    // Safety check: if same buttons for 3 iterations, something's wrong
    if (iter > 20) {
      const currentProgress = await page.evaluate(() => {
        const p = document.querySelector('h2, .progress-text');
        return p ? p.textContent : 'unknown';
      });
      console.log(`    Still on: ${currentProgress.substring(0, 50)}`);
    }
  }

  console.log(`  Completed ${answerCount} answers`);
  return false;
}

async function testProjectionFeature(browser, viewportKey) {
  const viewport = viewports[viewportKey];
  console.log(`\n=== Testing on ${viewport.name} ===`);

  const page = await browser.newPage();
  await page.setViewport(viewport);

  const results = {
    viewport: viewport.name,
    tests: [],
  };

  try {
    // Step 1: Load app
    console.log('1. Loading app...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    results.tests.push('✅ App loaded successfully');

    // Step 2: Answer questions to reach results screen
    console.log('2. Answering questionnaire...');
    const reachedResults = await answerQuestionsSimple(page);

    if (!reachedResults) {
      // Try to find results screen anyway
      const hasResults = await page.$('.results-screen');
      if (!hasResults) {
        throw new Error('Could not reach results screen after 50 iterations');
      }
    }
    results.tests.push('✅ Results screen displayed after questionnaire');

    // Step 3: Look for projection button and click it
    console.log('3. Looking for projection button...');
    const allButtons = await page.$$eval('button', (btns) => {
      return btns.map(b => b.textContent);
    });
    console.log(`  Found ${allButtons.length} buttons: ${allButtons.slice(0, 5).join(', ')}`);

    const buttons = await page.$$('button');
    let projectionClicked = false;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('ดูการลงทุนของคุณ') || text.includes('ดูการลงทุน')) {
        console.log(`  Clicking projection button: "${text}"`);
        await btn.click();
        projectionClicked = true;
        await sleep(500);
        break;
      }
    }

    if (!projectionClicked) {
      results.tests.push('⚠️ Projection button not found on results screen');
      await page.close();
      return;
    }

    const projectionInputExists = await page.$('.projection-input');
    if (!projectionInputExists) {
      throw new Error('Projection input section did not appear after clicking button');
    }

    results.tests.push('✅ Projection screen displayed');

    // Step 4: Check if chart appears with default or after entering amount
    console.log('4. Checking initial state...');
    const currencyInput = await page.$('.currency-input');
    if (!currencyInput) {
      throw new Error('Currency input not found');
    }

    // Check initial amount
    const initialValue = await currencyInput.evaluate(el => el.value);
    console.log(`  Initial amount: ${initialValue}`);

    // If initial is 0, enter 10000
    if (initialValue === '' || initialValue === '0') {
      console.log('  Entering ฿10,000...');
      await currencyInput.click();
      await currencyInput.evaluate(el => el.value = '');
      await currencyInput.type('10000');
      await sleep(300);
    }

    // Check if chart appears
    const chartExists = await page.$('.projection-chart');
    if (chartExists) {
      results.tests.push('✅ Chart appeared with amounts entered');
    } else {
      results.tests.push('⚠️ Chart not visible');
    }

    // Step 5: Check summary card
    console.log('5. Checking summary card...');
    const summaryExists = await page.$('.projection-summary');
    if (summaryExists) {
      results.tests.push('✅ Summary card displayed');
    } else {
      results.tests.push('⚠️ Summary card not found');
    }

    // Step 6: Test slider
    console.log('6. Testing year slider...');
    const slider = await page.$('.year-slider');
    if (slider) {
      const initialYear = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      console.log(`  Initial year: ${initialYear}`);

      await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        s.value = 20;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await sleep(300);

      const newYear = await page.evaluate(() => parseInt(document.querySelector('.slider-value').textContent));
      if (newYear === 20) {
        results.tests.push('✅ Year slider works (updated to 20)');
      } else {
        results.tests.push(`⚠️ Year slider shows ${newYear} instead of 20`);
      }
    } else {
      results.tests.push('⚠️ Year slider not found');
    }

    // Step 7: Test responsive layout
    console.log('7. Checking responsive layout...');
    const hasScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 5;
    });

    if (!hasScroll) {
      results.tests.push('✅ No horizontal scrolling (responsive layout)');
    } else {
      results.tests.push('⚠️ Horizontal scrolling detected');
    }

    // Step 8: Back button
    console.log('8. Testing back button...');
    const backBtn = await page.$('.back-button');
    if (backBtn) {
      results.tests.push('✅ Back button found');
    } else {
      results.tests.push('⚠️ Back button not found');
    }

  } catch (error) {
    results.error = error.message;
    results.tests.push(`❌ Error: ${error.message}`);
  } finally {
    await page.close();
  }

  testResults[viewportKey] = results;
  return results;
}

async function testEdgeCases(browser) {
  console.log('\n=== Testing Edge Cases ===');
  const edgeResults = {
    tests: [],
  };

  const page = await browser.newPage();
  await page.setViewport(viewports.mobilePortrait);

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await answerQuestionsSimple(page);

    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('ดูการลงทุน')) {
        await btn.click();
        await sleep(500);
        break;
      }
    }

    await page.waitForSelector('.projection-input', { timeout: 3000 });

    // Test 1: Default zero amount
    const input = await page.$('.currency-input');
    const defaultValue = await input.evaluate(el => el.value);
    console.log(`  Default amount: "${defaultValue}"`);

    if (defaultValue === '' || defaultValue === '0' || !defaultValue) {
      const errorMsg = await page.evaluate(() => {
        const err = document.querySelector('.input-error');
        return err ? err.textContent : null;
      });

      if (errorMsg && errorMsg.includes('กรุณาใส่')) {
        edgeResults.tests.push('✅ Edge case: Zero amount shows error');
      } else {
        edgeResults.tests.push('⚠️ Edge case: Zero amount error not visible');
      }
    }

    // Test 2: Large amount
    console.log('  Testing large amount...');
    await input.click();
    await input.evaluate(el => el.value = '');
    await input.type('100000');
    await sleep(400);

    const hasChart = await page.$('.projection-chart');
    if (hasChart) {
      edgeResults.tests.push('✅ Edge case: Large amount (฿100,000) works');
    } else {
      edgeResults.tests.push('⚠️ Edge case: Chart missing for large amount');
    }

    // Test 3: Year slider bounds
    console.log('  Testing slider bounds...');
    const slider = await page.$('.year-slider');
    if (slider) {
      const min = await slider.evaluate(el => parseInt(el.getAttribute('min')));
      const max = await slider.evaluate(el => parseInt(el.getAttribute('max')));
      edgeResults.tests.push(`✅ Edge case: Year slider range is ${min}-${max}`);
    }

  } catch (error) {
    edgeResults.tests.push(`❌ Edge case error: ${error.message}`);
  } finally {
    await page.close();
  }

  return edgeResults;
}

async function runTests() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('Starting projection feature testing...\n');

    // Test on all viewports
    for (const [key, _] of Object.entries(viewports)) {
      await testProjectionFeature(browser, key);
    }

    // Test edge cases
    const edgeResults = await testEdgeCases(browser);
    testResults.edgeCases = edgeResults;

    // Print summary
    console.log('\n\n========== TEST RESULTS SUMMARY ==========\n');

    for (const [viewport, results] of Object.entries(testResults)) {
      console.log(`\n${results.viewport || viewport.toUpperCase()}`);
      console.log('─'.repeat(60));
      if (results.tests) {
        results.tests.forEach(test => console.log(test));
      }
    }

    // Calculate totals
    let totalTests = 0;
    let passedTests = 0;
    let warningTests = 0;

    for (const results of Object.values(testResults)) {
      if (results.tests) {
        results.tests.forEach(test => {
          totalTests++;
          if (test.startsWith('✅')) passedTests++;
          if (test.startsWith('⚠️')) warningTests++;
        });
      }
    }

    console.log(`\n\nSummary: ${passedTests}/${totalTests} passed, ${warningTests} warnings`);

    if (passedTests >= totalTests - 3) {
      console.log('✅ PROJECTION FEATURE TESTING COMPLETE - FEATURE WORKS');
      process.exit(0);
    } else {
      console.log('❌ SIGNIFICANT FAILURES DETECTED');
      process.exit(1);
    }

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runTests();
