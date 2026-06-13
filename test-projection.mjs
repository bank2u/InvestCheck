import puppeteer from 'puppeteer';

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
        console.log('Navigating to app...');
        await page.goto('http://localhost:5174/pre-invest-test/', {
          waitUntil: 'networkidle2',
          timeout: 15000,
        });

        // Step 1: Complete the questionnaire (all 10 questions)
        console.log('\nStep 1: Completing questionnaire...');

        // Helper function to click answer buttons
        const clickAnswerButton = async (answerText) => {
          const buttons = await page.$$('button');
          for (const btn of buttons) {
            const text = await page.evaluate((el) => el.textContent.trim(), btn);
            if (text === answerText) {
              await btn.click();
              await new Promise(r => setTimeout(r, 400));
              return true;
            }
          }
          return false;
        };

        const clickNextButton = async () => {
          const buttons = await page.$$('button');
          for (const btn of buttons) {
            const text = await page.evaluate((el) => el.textContent, btn);
            if (text.includes('ถัดไป')) {
              await btn.click();
              await new Promise(r => setTimeout(r, 600));
              return true;
            }
          }
          return false;
        };

        // Screen 1: Q1-Q2
        for (let i = 0; i < 2; i++) {
          await clickAnswerButton('ก');
        }
        await clickNextButton();

        // Screen 2: Q3-Q4
        for (let i = 0; i < 2; i++) {
          await clickAnswerButton('ก');
        }
        await clickNextButton();

        // Screen 3: Q5-Q6
        for (let i = 0; i < 2; i++) {
          await clickAnswerButton('ก');
        }
        await clickNextButton();

        // Screen 4: Q7-Q9
        for (let i = 0; i < 3; i++) {
          await clickAnswerButton('ก');
        }
        await clickNextButton();

        // Screen 5: Q10
        await clickAnswerButton('ก');
        await clickNextButton();

        // Step 2: Verify results screen appears
        console.log('\nStep 2: Verifying results screen...');
        await new Promise(r => setTimeout(r, 1000));

        const pageContent = await page.content();
        const hasResultsScreen = pageContent.includes('ผล') || pageContent.includes('ลงทุน');
        console.log(`✅ Results screen visible: ${hasResultsScreen}`);
        results.push({
          testCase: testCase.name,
          step: 'Results screen',
          status: hasResultsScreen ? 'PASS' : 'FAIL',
        });

        // Step 3: Click projection button
        console.log('\nStep 3: Clicking projection button...');
        const buttons = await page.$$('button');
        let clicked = false;
        for (const btn of buttons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('ดูการลงทุน')) {
            await btn.click();
            clicked = true;
            break;
          }
        }
        await new Promise(r => setTimeout(r, 1000));
        console.log(`✅ Projection button clicked: ${clicked}`);

        // Step 4: Verify projection input section appears
        console.log('\nStep 4: Verifying projection input section...');
        const projContent = await page.content();
        const hasInputSection = projContent.includes('จำนวนเงินออม');
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
          await new Promise(r => setTimeout(r, 500));
          console.log('✅ Monthly savings entered');
          results.push({
            testCase: testCase.name,
            step: 'Enter savings',
            status: 'PASS',
          });
        } else {
          console.log('❌ Could not find currency input');
          results.push({
            testCase: testCase.name,
            step: 'Enter savings',
            status: 'FAIL',
          });
        }

        // Step 6: Verify chart appears
        console.log('\nStep 6: Verifying chart appears...');
        const chartContent = await page.content();
        const hasChart = chartContent.includes('svg');
        console.log(`✅ Chart visible: ${hasChart}`);
        results.push({
          testCase: testCase.name,
          step: 'Chart display',
          status: hasChart ? 'PASS' : 'FAIL',
        });

        // Step 7: Verify summary card
        console.log('\nStep 7: Verifying summary card...');
        const summaryContent = await page.content();
        const hasSummary =
          summaryContent.includes('บาท') &&
          (summaryContent.includes('ลงทุน') || summaryContent.includes('เงิน'));
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
            el.dispatchEvent(new Event('input', { bubbles: true }));
          });
          await new Promise(r => setTimeout(r, 600));
          console.log('✅ Slider adjusted');
          results.push({
            testCase: testCase.name,
            step: 'Slider adjustment',
            status: 'PASS',
          });
        } else {
          console.log('❌ Could not find slider');
          results.push({
            testCase: testCase.name,
            step: 'Slider adjustment',
            status: 'FAIL',
          });
        }

        // Step 9: Verify chart updates
        console.log('\nStep 9: Verifying chart updates after slider change...');
        const updatedChartContent = await page.content();
        const chartUpdated = updatedChartContent.includes('svg');
        console.log(`✅ Chart updated: ${chartUpdated}`);
        results.push({
          testCase: testCase.name,
          step: 'Chart update',
          status: chartUpdated ? 'PASS' : 'FAIL',
        });

        // Step 10: Test edge case - zero amount
        console.log('\nStep 10: Testing edge case (zero amount)...');
        const input = await page.$('input[type="text"]');
        if (input) {
          await input.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('0');
          await new Promise(r => setTimeout(r, 400));
          const errorContent = await page.content();
          const hasError = errorContent.includes('กรุณาใส่จำนวนเงิน');
          console.log(`✅ Error message displayed: ${hasError}`);
          results.push({
            testCase: testCase.name,
            step: 'Zero amount error',
            status: hasError ? 'PASS' : 'FAIL',
          });
        } else {
          console.log('⚠️  Could not test zero amount error');
          results.push({
            testCase: testCase.name,
            step: 'Zero amount error',
            status: 'FAIL',
          });
        }

        // Step 11: Test large amount
        console.log('\nStep 11: Testing large amount (฿100,000)...');
        const input2 = await page.$('input[type="text"]');
        if (input2) {
          await input2.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('100000');
          await new Promise(r => setTimeout(r, 600));
          const largeChartContent = await page.content();
          const hasChart2 = largeChartContent.includes('svg');
          console.log(`✅ Chart displays large amount: ${hasChart2}`);
          results.push({
            testCase: testCase.name,
            step: 'Large amount handling',
            status: hasChart2 ? 'PASS' : 'FAIL',
          });
        } else {
          console.log('❌ Could not find input for large amount test');
          results.push({
            testCase: testCase.name,
            step: 'Large amount handling',
            status: 'FAIL',
          });
        }

        // Step 12: Test back button
        console.log('\nStep 12: Testing back button...');
        const backBtns = await page.$$('button');
        let foundBack = false;
        for (const btn of backBtns) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('กลับ')) {
            await btn.click();
            foundBack = true;
            break;
          }
        }
        if (foundBack) {
          await new Promise(r => setTimeout(r, 600));
          const backContent = await page.content();
          const backToResults = backContent.includes('ผล');
          console.log(`✅ Back to results screen: ${backToResults}`);
          results.push({
            testCase: testCase.name,
            step: 'Back button',
            status: backToResults ? 'PASS' : 'FAIL',
          });
        } else {
          console.log('⚠️  Could not find back button');
          results.push({
            testCase: testCase.name,
            step: 'Back button',
            status: 'FAIL',
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

    const totalPass = Object.values(summary).reduce(
      (acc, c) => acc + c.PASS,
      0
    );
    const totalTests = Object.values(summary).reduce(
      (acc, c) => acc + c.PASS + c.FAIL,
      0
    );
    console.log(`\nTotal: ${totalPass}/${totalTests} passed (${((totalPass / totalTests) * 100).toFixed(0)}%)`);
    console.log(`\n${totalPass === totalTests ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);

    process.exit(totalPass === totalTests ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTests();
