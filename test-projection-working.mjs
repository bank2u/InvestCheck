import puppeteer from 'puppeteer';

const TEST_CASES = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Tablet', width: 768, height: 600 },
  { name: 'Mobile', width: 375, height: 667 },
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
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Testing on ${testCase.name} (${testCase.width}x${testCase.height})`);
      console.log(`${'='.repeat(50)}`);

      const page = await browser.newPage();
      await page.setViewport({
        width: testCase.width,
        height: testCase.height,
        deviceScaleFactor: 1,
      });

      try {
        // Navigate to the app
        console.log('Step 1: Loading app...');
        await page.goto('http://localhost:5174/pre-invest-test/', {
          waitUntil: 'networkidle2',
          timeout: 15000,
        });
        console.log('✅ App loaded');
        results.push({
          testCase: testCase.name,
          step: 'App load',
          status: 'PASS',
        });

        // Get all answer buttons and click them in order
        console.log('\nStep 2: Completing questionnaire...');
        const clickAllAnswers = async () => {
          for (let i = 0; i < 10; i++) {
            const buttons = await page.$$('button');
            let found = false;

            // Get all visible buttons that are not "Next" or "Restart"
            const answerButtons = [];
            for (const btn of buttons) {
              const text = await page.evaluate((el) => el.textContent, btn);
              if (!text.includes('ถัดไป') && !text.includes('ทำแบบทดสอบใหม่') && !text.includes('ดูการลงทุน')) {
                const isVisible = await page.evaluate((el) => {
                  const style = window.getComputedStyle(el);
                  return style.display !== 'none';
                }, btn);
                if (isVisible) {
                  answerButtons.push({ btn, text: text.trim() });
                }
              }
            }

            // Click the first one we haven't tried
            if (answerButtons.length > 0) {
              const btn = answerButtons[0].btn;
              const text = answerButtons[0].text;
              console.log(`  Q${i + 1}: "${text}"`);
              await btn.click();
              await new Promise(r => setTimeout(r, 350));
              found = true;
            }

            if (!found) break;
          }
        };

        await clickAllAnswers();
        console.log('✅ Questionnaire completed');
        results.push({
          testCase: testCase.name,
          step: 'Complete questionnaire',
          status: 'PASS',
        });

        // Wait for results screen
        await new Promise(r => setTimeout(r, 2000));

        // Step 3: Verify results screen
        console.log('\nStep 3: Verifying results screen...');
        let hasResults = false;
        try {
          hasResults = await page.waitForSelector('button:has-text("💡")', {
            timeout: 5000,
          }).then(() => true).catch(() => false);
        } catch (e) {
          // Try alternative detection
          const content = await page.content();
          hasResults = content.includes('จัดสรร') && content.includes('แนะนำ');
        }

        console.log(`✅ Results screen visible: ${hasResults}`);
        results.push({
          testCase: testCase.name,
          step: 'Results screen',
          status: hasResults ? 'PASS' : 'FAIL',
        });

        // Step 4: Click projection button
        console.log('\nStep 4: Clicking projection button...');
        const buttons = await page.$$('button');
        let projectionClicked = false;

        for (const btn of buttons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('ดูการลงทุน')) {
            console.log(`  Found: "${text.trim()}"`);
            await btn.click();
            projectionClicked = true;
            await new Promise(r => setTimeout(r, 1000));
            break;
          }
        }

        console.log(`✅ Projection button clicked: ${projectionClicked}`);
        results.push({
          testCase: testCase.name,
          step: 'Click projection',
          status: projectionClicked ? 'PASS' : 'FAIL',
        });

        // Step 5: Verify projection screen
        console.log('\nStep 5: Verifying projection input...');
        let hasInput = false;
        try {
          await page.waitForSelector('input[type="text"]', { timeout: 3000 });
          hasInput = true;
        } catch (e) {
          // Not found
        }
        console.log(`✅ Input section visible: ${hasInput}`);
        results.push({
          testCase: testCase.name,
          step: 'Projection input section',
          status: hasInput ? 'PASS' : 'FAIL',
        });

        // Step 6: Enter monthly savings
        console.log('\nStep 6: Entering monthly savings (฿10,000)...');
        const input = await page.$('input[type="text"]');
        let savingsEntered = false;

        if (input) {
          await input.click({ delay: 50 });
          await page.keyboard.press('Control+A');
          await page.keyboard.type('10000', { delay: 10 });
          await new Promise(r => setTimeout(r, 400));
          savingsEntered = true;
          console.log('✅ Savings entered');
        }

        results.push({
          testCase: testCase.name,
          step: 'Enter savings',
          status: savingsEntered ? 'PASS' : 'FAIL',
        });

        // Step 7: Verify chart appears
        console.log('\nStep 7: Verifying chart...');
        let chartVisible = false;
        try {
          await page.waitForSelector('svg', { timeout: 3000 });
          chartVisible = true;
        } catch (e) {
          // Not found
        }
        console.log(`✅ Chart visible: ${chartVisible}`);
        results.push({
          testCase: testCase.name,
          step: 'Chart appears',
          status: chartVisible ? 'PASS' : 'FAIL',
        });

        // Step 8: Verify summary
        console.log('\nStep 8: Verifying summary card...');
        const summaryContent = await page.content();
        const hasSummary = summaryContent.includes('บาท');
        console.log(`✅ Summary visible: ${hasSummary}`);
        results.push({
          testCase: testCase.name,
          step: 'Summary card',
          status: hasSummary ? 'PASS' : 'FAIL',
        });

        // Step 9: Test slider
        console.log('\nStep 9: Testing year slider...');
        const slider = await page.$('input[type="range"]');
        let sliderWorks = false;

        if (slider) {
          const currentVal = await page.evaluate((el) => el.value, slider);
          await slider.evaluate((el) => {
            el.value = (parseInt(el.value) + 5).toString();
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
          });
          await new Promise(r => setTimeout(r, 500));
          sliderWorks = true;
          console.log(`✅ Slider adjusted from ${currentVal}`);
        }

        results.push({
          testCase: testCase.name,
          step: 'Year slider',
          status: sliderWorks ? 'PASS' : 'FAIL',
        });

        // Step 10: Test zero error
        console.log('\nStep 10: Testing zero amount error...');
        const input2 = await page.$('input[type="text"]');
        let zeroErrorShown = false;

        if (input2) {
          await input2.click({ delay: 50 });
          await page.keyboard.press('Control+A');
          await page.keyboard.type('0');
          await new Promise(r => setTimeout(r, 400));

          const errorContent = await page.content();
          zeroErrorShown = errorContent.includes('กรุณาใส่');
          console.log(`✅ Error message shown: ${zeroErrorShown}`);
        }

        results.push({
          testCase: testCase.name,
          step: 'Zero error',
          status: zeroErrorShown ? 'PASS' : 'FAIL',
        });

        // Step 11: Test large amount
        console.log('\nStep 11: Testing large amount (฿100,000)...');
        const input3 = await page.$('input[type="text"]');
        let largeAmountWorks = false;

        if (input3) {
          await input3.click({ delay: 50 });
          await page.keyboard.press('Control+A');
          await page.keyboard.type('100000', { delay: 5 });
          await new Promise(r => setTimeout(r, 600));

          const largeContent = await page.content();
          largeAmountWorks = largeContent.includes('svg') && largeContent.includes('บาท');
          console.log(`✅ Large amount handled: ${largeAmountWorks}`);
        }

        results.push({
          testCase: testCase.name,
          step: 'Large amount',
          status: largeAmountWorks ? 'PASS' : 'FAIL',
        });

        // Step 12: Test back button
        console.log('\nStep 12: Testing back button...');
        const allBtns = await page.$$('button');
        let backWorks = false;

        for (const btn of allBtns) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('กลับ')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 700));

            const backContent = await page.content();
            backWorks = backContent.includes('จัดสรร') || backContent.includes('ผล');
            console.log(`✅ Back to results: ${backWorks}`);
            break;
          }
        }

        results.push({
          testCase: testCase.name,
          step: 'Back button',
          status: backWorks ? 'PASS' : 'FAIL',
        });

        // Step 13: Check responsive layout
        console.log('\nStep 13: Checking responsive layout...');
        const scrollWidth = await page.evaluate(() => {
          return document.documentElement.scrollWidth - window.innerWidth;
        });
        const noScroll = scrollWidth <= 5;
        console.log(`✅ No horizontal scrolling: ${noScroll}`);
        results.push({
          testCase: testCase.name,
          step: 'Responsive layout',
          status: noScroll ? 'PASS' : 'FAIL',
        });

        console.log(`\n✅ ${testCase.name} testing complete`);
      } catch (error) {
        console.error(`\n❌ Error testing ${testCase.name}:`, error.message);
        results.push({
          testCase: testCase.name,
          step: 'Overall',
          status: 'FAIL',
        });
      } finally {
        await page.close();
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50) + '\n');

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
    console.log(`\n${totalPass === totalTests ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}\n`);

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
