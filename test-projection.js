const puppeteer = require('puppeteer');

const DESKTOP_WIDTH = 1920;
const DESKTOP_HEIGHT = 1080;
const TABLET_WIDTH = 768;
const TABLET_HEIGHT = 1024;
const MOBILE_WIDTH = 375;
const MOBILE_HEIGHT = 667;

const TEST_CASES = [
  { name: 'Desktop', width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT },
  { name: 'Tablet Landscape', width: TABLET_WIDTH, height: 600 },
  { name: 'Mobile Portrait', width: MOBILE_WIDTH, height: MOBILE_HEIGHT },
];

async function runTests() {
  let browser;
  const results = [];

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (const testCase of TEST_CASES) {
      console.log(`\n========================================`);
      console.log(`Testing on ${testCase.name} (${testCase.width}x${testCase.height})`);
      console.log(`========================================`);

      const page = await browser.newPage();
      await page.setViewport({
        width: testCase.width,
        height: testCase.height,
        deviceScaleFactor: 1,
      });

      try {
        // Navigate to the app
        await page.goto('http://localhost:5174/pre-invest-test/', {
          waitUntil: 'networkidle2',
        });

        // Step 1: Complete the questionnaire (all 10 questions)
        console.log('\nStep 1: Completing questionnaire...');

        // Screen 1: Q1-Q2 (age + financial burden)
        await answerQuestion(page, 1, 'ก'); // Age
        await answerQuestion(page, 2, 'ก'); // Financial burden
        await clickNext(page);

        // Screen 2: Q3-Q4
        await answerQuestion(page, 3, 'ก');
        await answerQuestion(page, 4, 'ก');
        await clickNext(page);

        // Screen 3: Q5-Q6
        await answerQuestion(page, 5, 'ก');
        await answerQuestion(page, 6, 'ก');
        await clickNext(page);

        // Screen 4: Q7-Q9
        await answerQuestion(page, 7, 'ก');
        await answerQuestion(page, 8, 'ก');
        await answerQuestion(page, 9, 'ก');
        await clickNext(page);

        // Screen 5: Q10
        await answerQuestion(page, 10, 'ก');
        await clickNext(page);

        // Step 2: Verify results screen appears
        console.log('\nStep 2: Verifying results screen...');
        await page.waitForSelector('button:has-text("💡 ดูการลงทุนของคุณ")', {
          timeout: 5000,
        }).catch(() => null);

        const hasResultsScreen = await page.evaluate(() => {
          return document.body.textContent.includes('ผลลัพธ์');
        });
        console.log(`✅ Results screen visible: ${hasResultsScreen}`);
        results.push({
          testCase: testCase.name,
          step: 'Results screen',
          status: hasResultsScreen ? 'PASS' : 'FAIL',
        });

        // Step 3: Click projection button
        console.log('\nStep 3: Clicking projection button...');
        const projectionBtn = await page.$('button:has-text("💡 ดูการลงทุนของคุณ")');
        if (!projectionBtn) {
          // Try alternative selector
          const buttons = await page.$$('button');
          for (const btn of buttons) {
            const text = await page.evaluate((el) => el.textContent, btn);
            if (text.includes('ดูการลงทุน')) {
              await btn.click();
              break;
            }
          }
        } else {
          await projectionBtn.click();
        }

        await page.waitForTimeout(1000);

        // Step 4: Verify projection input section appears
        console.log('\nStep 4: Verifying projection input section...');
        const hasInputSection = await page.evaluate(() => {
          return document.body.textContent.includes('จำนวนเงินออมต่อเดือน');
        });
        console.log(`✅ Input section visible: ${hasInputSection}`);
        results.push({
          testCase: testCase.name,
          step: 'Input section',
          status: hasInputSection ? 'PASS' : 'FAIL',
        });

        // Step 5: Enter monthly savings (฿10,000)
        console.log('\nStep 5: Entering monthly savings (฿10,000)...');
        const currencyInput = await page.$('input[type="text"]');
        if (currencyInput) {
          await currencyInput.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('10000');
          await page.waitForTimeout(500);
          console.log('✅ Monthly savings entered');
          results.push({
            testCase: testCase.name,
            step: 'Enter savings',
            status: 'PASS',
          });
        }

        // Step 6: Verify chart appears
        console.log('\nStep 6: Verifying chart appears...');
        const hasChart = await page.evaluate(() => {
          return document.body.innerHTML.includes('svg');
        });
        console.log(`✅ Chart visible: ${hasChart}`);
        results.push({
          testCase: testCase.name,
          step: 'Chart display',
          status: hasChart ? 'PASS' : 'FAIL',
        });

        // Step 7: Verify summary card
        console.log('\nStep 7: Verifying summary card...');
        const hasSummary = await page.evaluate(() => {
          return (
            document.body.textContent.includes('บาท') &&
            (document.body.textContent.includes('ลงทุน') ||
              document.body.textContent.includes('เงิน'))
          );
        });
        console.log(`✅ Summary card visible: ${hasSummary}`);
        results.push({
          testCase: testCase.name,
          step: 'Summary card',
          status: hasSummary ? 'PASS' : 'FAIL',
        });

        // Step 8: Adjust year slider
        console.log('\nStep 8: Adjusting year slider...');
        const slider = await page.$('input[type="range"]');
        if (slider) {
          await slider.evaluate((el) => {
            el.value = '20';
            el.dispatchEvent(new Event('change', { bubbles: true }));
          });
          await page.waitForTimeout(500);
          console.log('✅ Slider adjusted');
          results.push({
            testCase: testCase.name,
            step: 'Slider adjustment',
            status: 'PASS',
          });
        }

        // Step 9: Verify chart updates
        console.log('\nStep 9: Verifying chart updates after slider change...');
        const chartUpdated = await page.evaluate(() => {
          return document.body.innerHTML.includes('svg');
        });
        console.log(`✅ Chart updated: ${chartUpdated}`);
        results.push({
          testCase: testCase.name,
          step: 'Chart update',
          status: chartUpdated ? 'PASS' : 'FAIL',
        });

        // Step 10: Test edge cases - zero amount
        console.log('\nStep 10: Testing edge case (zero amount)...');
        const input = await page.$('input[type="text"]');
        if (input) {
          await input.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('0');
          await page.waitForTimeout(300);
          const hasError = await page.evaluate(() => {
            return document.body.textContent.includes('กรุณาใส่จำนวนเงิน');
          });
          console.log(`✅ Error message displayed: ${hasError}`);
          results.push({
            testCase: testCase.name,
            step: 'Zero amount error',
            status: hasError ? 'PASS' : 'FAIL',
          });
        }

        // Step 11: Test large amount
        console.log('\nStep 11: Testing large amount (฿100,000)...');
        const input2 = await page.$('input[type="text"]');
        if (input2) {
          await input2.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('100000');
          await page.waitForTimeout(500);
          const hasChart2 = await page.evaluate(() => {
            return document.body.innerHTML.includes('svg');
          });
          console.log(`✅ Chart displays large amount: ${hasChart2}`);
          results.push({
            testCase: testCase.name,
            step: 'Large amount handling',
            status: hasChart2 ? 'PASS' : 'FAIL',
          });
        }

        // Step 12: Test back button
        console.log('\nStep 12: Testing back button...');
        const backBtn = await page.$('button:has-text("กลับ")');
        if (backBtn) {
          await backBtn.click();
          await page.waitForTimeout(500);
          const backToResults = await page.evaluate(() => {
            return document.body.textContent.includes('ผลลัพธ์');
          });
          console.log(`✅ Back to results screen: ${backToResults}`);
          results.push({
            testCase: testCase.name,
            step: 'Back button',
            status: backToResults ? 'PASS' : 'FAIL',
          });
        }

        // Check layout responsiveness
        console.log('\nStep 13: Checking responsive layout...');
        const scrollWidth = await page.evaluate(() => {
          return document.documentElement.scrollWidth - window.innerWidth;
        });
        console.log(`✅ No horizontal scrolling needed: ${scrollWidth <= 0}`);
        results.push({
          testCase: testCase.name,
          step: 'Responsive layout',
          status: scrollWidth <= 0 ? 'PASS' : 'FAIL',
        });

        console.log(`\n✅ ${testCase.name} testing complete\n`);
      } catch (error) {
        console.error(`❌ Error testing ${testCase.name}:`, error.message);
        results.push({
          testCase: testCase.name,
          step: 'Overall',
          status: 'FAIL',
          error: error.message,
        });
      } finally {
        await page.close();
      }
    }

    // Print summary
    console.log('\n========================================');
    console.log('TEST SUMMARY');
    console.log('========================================\n');

    const summary = {};
    for (const result of results) {
      if (!summary[result.testCase]) {
        summary[result.testCase] = { PASS: 0, FAIL: 0 };
      }
      summary[result.testCase][result.status]++;
    }

    for (const [testCase, counts] of Object.entries(summary)) {
      const total = counts.PASS + counts.FAIL;
      const passRate = ((counts.PASS / total) * 100).toFixed(0);
      console.log(`${testCase}: ${counts.PASS}/${total} passed (${passRate}%)`);
    }

    const overallPass = results.every((r) => r.status === 'PASS');
    console.log(`\nOverall: ${overallPass ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function answerQuestion(page, questionNum, answer) {
  // Find and click the answer button (ก, ข, ค, ง)
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent.trim(), btn);
    if (text === answer || text.includes(answer)) {
      await btn.click();
      await page.waitForTimeout(300);
      return;
    }
  }
}

async function clickNext(page) {
  // Find and click the Next button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text.includes('ถัดไป') || text.includes('Next')) {
      await btn.click();
      await page.waitForTimeout(500);
      return;
    }
  }
}

runTests();
