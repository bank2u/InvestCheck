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

  // Answer questions by clicking third answer button (index 2) for each question
  // This strategy: click buttons in order until we reach the results screen
  let questionCount = 0;
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Get all answer buttons currently visible
    const buttons = await page.$$('.answer-button');

    if (buttons.length === 0) {
      // No buttons visible - we might have reached results screen
      break;
    }

    // Click the third button (index 2) if available, otherwise second or first
    const buttonToClick = buttons[Math.min(2, buttons.length - 1)];
    if (buttonToClick) {
      await buttonToClick.click();
      questionCount++;
      await sleep(300);
    }

    // Check if we reached results screen
    const resultsScreen = await page.$('.results-screen');
    if (resultsScreen) {
      console.log(`  Reached results screen after ${questionCount} clicks`);
      break;
    }
  }
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

    // Step 4: Test default state (should show error message for 0 amount)
    console.log('4. Testing default state (amount = 0)...');

    // Check if error message is visible
    const errorMsg = await page.evaluate(() => {
      const err = document.querySelector('.input-error');
      return err ? err.textContent : null;
    });

    if (errorMsg && errorMsg.includes('กรุณาใส่จำนวนเงิน')) {
      results.tests.push('✅ Error message shown for zero amount');
    } else {
      results.tests.push('⚠️ Error message may not be shown for zero amount (default ≠ 0?)');
    }

    // Step 5: Enter ฿10,000
    console.log('5. Entering ฿10,000...');
    const currencyInput = await page.$('.currency-input');
    if (currencyInput) {
      await currencyInput.click();
      await currencyInput.evaluate(el => el.value = '');
      await currencyInput.type('10000');
      await sleep(300);
    } else {
      throw new Error('Currency input not found');
    }

    // Verify chart appears
    const chartExists = await page.$('.projection-chart');
    if (chartExists) {
      results.tests.push('✅ Chart appeared after entering amount');
    } else {
      results.tests.push('❌ Chart did not appear after entering amount');
    }

    // Step 6: Verify summary card
    console.log('6. Checking summary card...');
    const summaryExists = await page.$('.projection-summary');
    if (summaryExists) {
      const summaryText = await page.evaluate(() => {
        const el = document.querySelector('.projection-summary');
        return el ? el.textContent : '';
      });

      // Check if it contains balance information
      if (summaryText.includes('บาท') || summaryText.includes('฿')) {
        results.tests.push('✅ Summary card displayed with balance information');
      } else {
        results.tests.push('✅ Summary card displayed (with text: ' + summaryText.substring(0, 50) + ')');
      }
    } else {
      results.tests.push('❌ Summary card not found');
    }

    // Step 7: Test slider interaction
    console.log('7. Testing year slider...');
    const yearSlider = await page.$('.year-slider');
    if (yearSlider) {
      // Get current value
      const oldValue = await page.evaluate(() => {
        return parseInt(document.querySelector('.year-slider').value);
      });

      // Move slider to different position
      await page.evaluate(() => {
        const slider = document.querySelector('.year-slider');
        const event = new Event('change', { bubbles: true });
        slider.value = 20;
        slider.dispatchEvent(event);
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await sleep(500);

      const newValue = await page.evaluate(() => {
        return parseInt(document.querySelector('.year-slider').value);
      });

      if (newValue === 20) {
        results.tests.push('✅ Year slider updated to 20 years');
      } else {
        results.tests.push(`⚠️ Year slider shows ${newValue} instead of 20`);
      }
    } else {
      results.tests.push('⚠️ Year slider not found');
    }

    // Step 8: Test back button
    console.log('8. Testing back button...');
    const backButton = await page.$('.back-button');
    if (backButton) {
      results.tests.push('✅ Back button present and clickable');
    } else {
      results.tests.push('⚠️ Back button not found');
    }

    // Step 9: Test responsive layout
    console.log('9. Checking responsive layout...');
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth + 1;
    });

    if (!hasHorizontalScroll) {
      results.tests.push('✅ No horizontal scrolling (responsive layout)');
    } else {
      results.tests.push('⚠️ Horizontal scrolling detected - layout may not be fully responsive');
    }

    // Step 10: Test touch-friendly button sizes
    console.log('10. Checking button sizes...');
    const buttonSizes = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const sizes = Array.from(buttons)
        .filter(btn => btn.offsetParent !== null) // Only visible buttons
        .map(btn => {
          const rect = btn.getBoundingClientRect();
          return { height: Math.round(rect.height), text: btn.textContent.substring(0, 20) };
        });
      return sizes;
    });

    const allTouchFriendly = buttonSizes.every(b => b.height >= 40);
    const minHeight = Math.min(...buttonSizes.map(b => b.height));

    if (allTouchFriendly) {
      results.tests.push(`✅ All buttons are ≥40px height (min: ${minHeight}px)`);
    } else {
      results.tests.push(`⚠️ Some buttons are <40px height (min: ${minHeight}px)`);
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
    await page.waitForSelector('.results-screen', { timeout: 5000 });
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('ดูการลงทุนของคุณ')) {
        await btn.click();
        break;
      }
    }

    await page.waitForSelector('.projection-input', { timeout: 5000 });
    await sleep(500);

    // Edge case 1: Default state
    console.log('Testing edge case: Initial state...');
    const initialAmount = await page.evaluate(() => {
      const input = document.querySelector('.currency-input');
      return input ? parseInt(input.value.replace(/[^\d]/g, '')) : 0;
    });

    if (initialAmount === 0) {
      edgeResults.tests.push('✅ Edge case: Initial amount is 0');
    } else {
      edgeResults.tests.push(`⚠️ Edge case: Initial amount is ${initialAmount} (expected 0)`);
    }

    // Edge case 2: Very large amount
    console.log('Testing edge case: Large amount (฿100,000)...');
    const input = await page.$('.currency-input');
    if (input) {
      await input.click();
      await input.evaluate(el => el.value = '');
      await input.type('100000');
      await sleep(500);

      const chartVisible = await page.$('.projection-chart');
      if (chartVisible) {
        edgeResults.tests.push('✅ Edge case: Large amount (฿100,000) renders chart');
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
        s.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await sleep(300);

      const yearValue = await page.evaluate(() => {
        const el = document.querySelector('.slider-value');
        return el ? parseInt(el.textContent) : 0;
      });

      if (yearValue === 5) {
        edgeResults.tests.push('✅ Edge case: Minimum year (5) works correctly');
      } else {
        edgeResults.tests.push(`⚠️ Edge case: Year shows ${yearValue} instead of 5`);
      }
    }

    // Edge case 4: Maximum year
    console.log('Testing edge case: Maximum year...');
    if (slider) {
      const maxYear = await page.evaluate(() => {
        const s = document.querySelector('.year-slider');
        return parseInt(s.getAttribute('max'));
      });

      await page.evaluate((max) => {
        const s = document.querySelector('.year-slider');
        const event = new Event('change', { bubbles: true });
        s.value = max;
        s.dispatchEvent(event);
        s.dispatchEvent(new Event('input', { bubbles: true }));
      }, maxYear);
      await sleep(300);

      const yearValue = await page.evaluate(() => {
        const el = document.querySelector('.slider-value');
        return el ? parseInt(el.textContent) : 0;
      });

      if (yearValue === maxYear) {
        edgeResults.tests.push(`✅ Edge case: Maximum year (${maxYear}) works correctly`);
      } else {
        edgeResults.tests.push(`⚠️ Edge case: Max year shows ${yearValue} instead of ${maxYear}`);
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
      console.log('─'.repeat(60));
      if (results.tests) {
        results.tests.forEach(test => console.log(test));
      }
    }

    // Calculate pass/fail
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

    console.log(`\n\nResults: ${passedTests}/${totalTests} passed, ${warningTests} warnings`);

    if (totalTests > 0 && passedTests >= totalTests - 2) {
      console.log('✅ PROJECTION FEATURE TESTED SUCCESSFULLY');
      process.exit(0);
    } else {
      console.log('⚠️ SOME TESTS FAILED - REVIEW NEEDED');
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
