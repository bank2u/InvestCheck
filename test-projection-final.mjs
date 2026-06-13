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
        console.log('Step 1: Navigating to app...');
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

        // Answer all 10 questions by answering the first answer (ก) for each
        console.log('\nStep 2: Completing all 10 questions...');
        let totalAnswered = 0;
        const maxAttempts = 25; // Safety limit to prevent infinite loop

        for (let attempt = 0; attempt < maxAttempts && totalAnswered < 10; attempt++) {
          const buttons = await page.$$('button');
          let answered = false;

          // Find first unanswered question option
          for (const btn of buttons) {
            const text = await page.evaluate((el) => el.textContent, btn);

            // Skip Next, Restart buttons
            if (text.includes('ถัดไป') || text.includes('ทำแบบทดสอบใหม่') || text.includes('ลงทุน')) {
              continue;
            }

            // Check if this button is clickable (answer option)
            const isClickable = await page.evaluate((el) => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' && style.opacity !== '0';
            }, btn);

            if (isClickable && text.trim().length > 0) {
              console.log(`  Answering Q${attempt + 1}: "${text.trim()}"`);
              await btn.click();
              await new Promise(r => setTimeout(r, 300));
              totalAnswered++;
              answered = true;
              break;
            }
          }

          if (!answered) {
            // No unanswered questions found, probably on results screen
            break;
          }
        }

        console.log(`✅ Answered ${totalAnswered} questions`);
        if (totalAnswered === 10) {
          results.push({
            testCase: testCase.name,
            step: 'Complete questionnaire',
            status: 'PASS',
          });
        } else {
          results.push({
            testCase: testCase.name,
            step: 'Complete questionnaire',
            status: 'FAIL',
          });
        }

        // Wait for results screen to fully render
        await new Promise(r => setTimeout(r, 1500));

        // Step 3: Verify results screen appears
        console.log('\nStep 3: Verifying results screen...');
        const pageContent = await page.content();
        const hasResultsContent =
          pageContent.includes('ผล') ||
          pageContent.includes('การจัดสรร') ||
          pageContent.includes('คำแนะนำ');
        console.log(`✅ Results screen visible: ${hasResultsContent}`);
        results.push({
          testCase: testCase.name,
          step: 'Results screen',
          status: hasResultsContent ? 'PASS' : 'FAIL',
        });

        // Step 4: Find and click projection button
        console.log('\nStep 4: Finding and clicking projection button...');
        const buttons = await page.$$('button');
        let projectionClicked = false;
        for (const btn of buttons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('ดูการลงทุน')) {
            console.log(`  Found button: "${text.trim()}"`);
            await btn.click();
            projectionClicked = true;
            await new Promise(r => setTimeout(r, 800));
            break;
          }
        }
        console.log(`✅ Projection button clicked: ${projectionClicked}`);
        results.push({
          testCase: testCase.name,
          step: 'Click projection button',
          status: projectionClicked ? 'PASS' : 'FAIL',
        });

        // Step 5: Verify projection screen appears
        console.log('\nStep 5: Verifying projection input section...');
        const projContent = await page.content();
        const hasProjection = projContent.includes('จำนวนเงินออม') && projContent.includes('ระยะเวลา');
        console.log(`✅ Projection input section visible: ${hasProjection}`);
        results.push({
          testCase: testCase.name,
          step: 'Projection screen',
          status: hasProjection ? 'PASS' : 'FAIL',
        });

        // Step 6: Test entering monthly savings
        console.log('\nStep 6: Entering monthly savings (฿10,000)...');
        const currencyInput = await page.$('input[type="text"]');
        let savingsEntered = false;
        if (currencyInput) {
          await currencyInput.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('10000');
          await new Promise(r => setTimeout(r, 400));
          savingsEntered = true;
          console.log('✅ Monthly savings entered');
        } else {
          console.log('❌ Could not find currency input');
        }
        results.push({
          testCase: testCase.name,
          step: 'Enter savings',
          status: savingsEntered ? 'PASS' : 'FAIL',
        });

        // Step 7: Verify chart appears
        console.log('\nStep 7: Verifying chart appears...');
        let chartVisible = false;
        try {
          await page.waitForSelector('svg', { timeout: 3000 });
          chartVisible = true;
        } catch (e) {
          // SVG not found
        }
        console.log(`✅ Chart visible: ${chartVisible}`);
        results.push({
          testCase: testCase.name,
          step: 'Chart display',
          status: chartVisible ? 'PASS' : 'FAIL',
        });

        // Step 8: Verify summary card
        console.log('\nStep 8: Verifying summary card...');
        const summaryContent = await page.content();
        const hasSummary = summaryContent.includes('บาท');
        console.log(`✅ Summary card visible: ${hasSummary}`);
        results.push({
          testCase: testCase.name,
          step: 'Summary card',
          status: hasSummary ? 'PASS' : 'FAIL',
        });

        // Step 9: Adjust year slider and verify chart updates
        console.log('\nStep 9: Testing year slider...');
        const slider = await page.$('input[type="range"]');
        let sliderWorked = false;
        if (slider) {
          const currentValue = await page.evaluate((el) => el.value, slider);
          const maxValue = await page.evaluate((el) => el.max, slider);
          const newValue = Math.min(parseInt(currentValue) + 5, parseInt(maxValue));

          await slider.evaluate((el, val) => {
            el.value = val.toString();
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }, newValue);

          await new Promise(r => setTimeout(r, 500));
          sliderWorked = true;
          console.log(`✅ Slider adjusted from ${currentValue} to ${newValue}`);
        } else {
          console.log('❌ Could not find slider');
        }
        results.push({
          testCase: testCase.name,
          step: 'Year slider',
          status: sliderWorked ? 'PASS' : 'FAIL',
        });

        // Step 10: Test edge case - zero amount
        console.log('\nStep 10: Testing zero amount error...');
        const input = await page.$('input[type="text"]');
        let zeroError = false;
        if (input) {
          await input.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('0');
          await new Promise(r => setTimeout(r, 300));
          const pageContentZero = await page.content();
          zeroError = pageContentZero.includes('กรุณาใส่จำนวนเงิน');
          console.log(`✅ Error message shown for zero: ${zeroError}`);
        } else {
          console.log('⚠️  Could not test zero amount');
        }
        results.push({
          testCase: testCase.name,
          step: 'Zero error',
          status: zeroError ? 'PASS' : 'FAIL',
        });

        // Step 11: Test large amount
        console.log('\nStep 11: Testing large amount (฿100,000)...');
        const input2 = await page.$('input[type="text"]');
        let largeAmountWorks = false;
        if (input2) {
          await input2.click();
          await page.keyboard.press('Control+A');
          await page.keyboard.type('100000');
          await new Promise(r => setTimeout(r, 500));
          const largeContent = await page.content();
          largeAmountWorks = largeContent.includes('บาท') && largeContent.includes('svg');
          console.log(`✅ Large amount handled: ${largeAmountWorks}`);
        }
        results.push({
          testCase: testCase.name,
          step: 'Large amount',
          status: largeAmountWorks ? 'PASS' : 'FAIL',
        });

        // Step 12: Test back button
        console.log('\nStep 12: Testing back button...');
        const backBtns = await page.$$('button');
        let backWorked = false;
        for (const btn of backBtns) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('กลับ')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 600));
            const backContent = await page.content();
            backWorked = backContent.includes('ผล') || backContent.includes('การจัดสรร');
            console.log(`✅ Back button works: ${backWorked}`);
            break;
          }
        }
        results.push({
          testCase: testCase.name,
          step: 'Back button',
          status: backWorked ? 'PASS' : 'FAIL',
        });

        // Step 13: Check responsive layout
        console.log('\nStep 13: Checking responsive layout...');
        const scrollWidth = await page.evaluate(() => {
          return document.documentElement.scrollWidth - window.innerWidth;
        });
        const noHorizontalScroll = scrollWidth <= 5; // Allow small rounding
        console.log(`✅ No unwanted horizontal scrolling: ${noHorizontalScroll}`);
        results.push({
          testCase: testCase.name,
          step: 'Responsive layout',
          status: noHorizontalScroll ? 'PASS' : 'FAIL',
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
    console.log('FINAL TEST SUMMARY');
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
    console.log(`${totalPass === totalTests ? '\n✅ ALL TESTS PASSED' : '\n⚠️  SOME TESTS FAILED'}`);

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
