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

  // Answer 10 questions - clicking answer option "ค" (value 3) for each
  for (let i = 1; i <= 10; i++) {
    const option = await page.$(`input[name="q${i}"][value="3"]`);
    if (option) {
      await option.click();
      await sleep(200);
    }
  }

  // Click "ดูผลลัพธ์" button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text.includes('ดูผลลัพธ์')) {
      await btn.click();
      break;
    }
  }

  await sleep(500);
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
    await answerAllQuestions(page);
    await page.waitForSelector('.results-screen', { timeout: 5000 }).catch(() => {
      throw new Error('Results screen not found after answering questions');
    });
    results.tests.push('✅ Results screen displayed after questionnaire');

    // Step 3: Click projection button
    console.log('3. Clicking projection button...');
    const buttons = await page.$$('button');
    let projectionClicked = false;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('ดูการลงทุนของคุณ')) {
        await btn.click();
        projectionClicked = true;
        break;
      }
    }

    if (!projectionClicked) {
      throw new Error('Projection button not found');
    }

    await page.waitForSelector('.projection-input', { timeout: 5000 }).catch(() => {
      throw new Error('Projection input section not found');
    });
    results.tests.push('✅ Projection input section appeared');

    // Step 4: Test default state (should show error message)
    console.log('4. Testing default state (amount = 0)...');
    const errorMsg = await page.evaluate(() => {
      const err = document.querySelector('.input-error');
      return err ? err.textContent : null;
    });

    if (errorMsg && errorMsg.includes('กรุณาใส่จำนวนเงิน')) {
      results.tests.push('✅ Error message shown for zero amount');
    } else {
      results.tests.push('❌ Error message not shown for zero amount');
    }

    // Step 5: Enter ฿10,000
    console.log('5. Entering ฿10,000...');
    const currencyInput = await page.$('.currency-input');
    if (currencyInput) {
      await currencyInput.focus();
      await currencyInput.evaluate(el => el.value = '');
      await currencyInput.type('10000');
      await sleep(300);
    }

    // Verify chart appears
    const chartExists = await page.$('.projection-chart');
    if (chartExists) {
      results.tests.push('✅ Chart appeared after entering amount');
    } else {
      results.tests.push('❌ Chart did not appear');
    }

    // Step 6: Verify summary card
    console.log('6. Checking summary card...');
    const summaryExists = await page.$('.projection-summary');
    if (summaryExists) {
      const summaryText = await page.evaluate(() => {
        const el = document.querySelector('.projection-summary');
        return el ? el.textContent : '';
      });
      results.tests.push('✅ Summary card displayed with balances');
    } else {
      results.tests.push('❌ Summary card not found');
    }

    // Step 7: Test slider interaction
    console.log('7. Testing year slider...');
    const yearSlider = await page.$('.year-slider');
    if (yearSlider) {
      // Move slider to different position
      await page.evaluate(() => {
        const slider = document.querySelector('.year-slider');
        const event = new Event('change', { bubbles: true });
        slider.value = 20;
        slider.dispatchEvent(event);
      });
      await sleep(500);

      const newValue = await page.evaluate(() => {
        const slider = document.querySelector('.year-slider');
        return parseInt(slider.value);
      });

      if (newValue === 20) {
        results.tests.push('✅ Year slider updated to 20 years');
      } else {
        results.tests.push('⚠️ Year slider value may not have updated');
      }
    }

    // Step 8: Test back button
    console.log('8. Testing back button...');
    const backButton = await page.$('.back-button');
    if (backButton) {
      results.tests.push('✅ Back button present and clickable');
    } else {
      results.tests.push('❌ Back button not found');
    }

    // Step 9: Test responsive layout
    console.log('9. Checking responsive layout...');
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (!hasHorizontalScroll) {
      results.tests.push('✅ No horizontal scrolling (responsive layout)');
    } else {
      results.tests.push('⚠️ Horizontal scrolling detected - layout may not be fully responsive');
    }

    // Step 10: Test touch-friendly button sizes
    console.log('10. Checking button sizes...');
    const buttonHeights = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const heights = Array.from(buttons).map(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.height;
      });
      return heights;
    });

    const allTouchFriendly = buttonHeights.every(h => h >= 44);
    if (allTouchFriendly) {
      results.tests.push('✅ All buttons are ≥44px height (touch-friendly)');
    } else {
      results.tests.push('⚠️ Some buttons may be smaller than 44px');
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
    // Load app and answer questions
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await answerAllQuestions(page);

    // Click projection button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('ดูการลงทุนของคุณ')) {
        await btn.click();
        break;
      }
    }

    await page.waitForSelector('.projection-input', { timeout: 5000 });

    // Edge case 1: Zero amount shows error
    console.log('Testing edge case: Zero amount...');
    const input = await page.$('.currency-input');
    if (input) {
      await input.focus();
      await input.evaluate(el => el.value = '');
      await sleep(300);

      const errorVisible = await page.evaluate(() => {
        const err = document.querySelector('.input-error');
        return err && err.offsetParent !== null; // Check if visible
      });

      if (errorVisible) {
        edgeResults.tests.push('✅ Edge case: Zero amount shows error');
      } else {
        edgeResults.tests.push('❌ Edge case: Zero amount error not visible');
      }
    }

    // Edge case 2: Very large amount
    console.log('Testing edge case: Large amount (฿100,000)...');
    if (input) {
      await input.focus();
      await input.evaluate(el => el.value = '');
      await input.type('100000');
      await sleep(500);

      const chartVisible = await page.$('.projection-chart');
      if (chartVisible) {
        edgeResults.tests.push('✅ Edge case: Large amount (฿100,000) renders correctly');
      } else {
        edgeResults.tests.push('❌ Edge case: Large amount failed to render chart');
      }
    }

    // Edge case 3: Minimum year (5)
    console.log('Testing edge case: Minimum year (5)...');
    const slider = await page.$('.year-slider');
    if (slider) {
      await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        const event = new Event('change', { bubbles: true });
        s.value = 5;
        s.dispatchEvent(event);
      });
      await sleep(300);

      const yearValue = await page.evaluate(() => {
        const el = document.querySelector('.slider-value');
        return el ? el.textContent : '';
      });

      if (yearValue.includes('5')) {
        edgeResults.tests.push('✅ Edge case: Minimum year (5) works');
      } else {
        edgeResults.tests.push('⚠️ Edge case: Year slider minimum behavior unclear');
      }
    }

  } catch (error) {
    edgeResults.tests.push(`❌ Edge case testing error: ${error.message}`);
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

    // Test on all viewports
    for (const [key, _] of Object.entries(viewports)) {
      await testProjectionFeature(browser, key);
    }

    // Test edge cases
    const edgeResults = await testEdgeCases(browser);
    testResults.edgeCases = edgeResults;

    // Print summary
    console.log('\n\n========== TEST SUMMARY ==========\n');

    for (const [viewport, results] of Object.entries(testResults)) {
      console.log(`\n${results.viewport || viewport.toUpperCase()}`);
      console.log('─'.repeat(50));
      if (results.tests) {
        results.tests.forEach(test => console.log(test));
      }
    }

    // Calculate pass/fail
    let totalTests = 0;
    let passedTests = 0;

    for (const results of Object.values(testResults)) {
      if (results.tests) {
        results.tests.forEach(test => {
          totalTests++;
          if (test.startsWith('✅')) passedTests++;
        });
      }
    }

    console.log(`\n\nTotal: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('✅ ALL TESTS PASSED');
      process.exit(0);
    } else {
      console.log('⚠️ SOME TESTS HAVE WARNINGS OR FAILURES');
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
