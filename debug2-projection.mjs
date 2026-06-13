import puppeteer from 'puppeteer';

async function debugApp() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Navigate to the app
    console.log('Navigating to app...');
    await page.goto('http://localhost:5174/pre-invest-test/', {
      waitUntil: 'networkidle2',
    });

    // Get initial page state
    console.log('Checking initial page...');
    let allText = await page.evaluate(() => document.body.innerText);
    console.log('Initial screen:\n', allText.substring(0, 500));

    // Better approach: find all visible answer buttons and click them in sequence
    const clickAnswerInSequence = async () => {
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons`);

      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent.trim(), btn);
        const isVisible = await page.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }, btn);

        if (isVisible && !text.includes('ถัดไป') && text.length > 0) {
          console.log(`Clicking answer: "${text}"`);
          await btn.click();
          await new Promise(r => setTimeout(r, 300));
          break;
        }
      }
    };

    // Answer all 20 questions (10 questions, 2-3 per screen)
    for (let i = 0; i < 20; i++) {
      const buttons = await page.$$('button');
      const nextBtn = buttons.find(async (btn) => {
        const text = await page.evaluate((el) => el.textContent, btn);
        return text.includes('ถัดไป');
      });

      // Check if we see a "Next" button
      let foundNextBtn = false;
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text.includes('ถัดไป')) {
          foundNextBtn = true;
          break;
        }
      }

      if (foundNextBtn && i % 2 === 1) {
        // Click next
        console.log(`\nClicking Next button (step ${i})`);
        for (const btn of buttons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text.includes('ถัดไป')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 600));
            break;
          }
        }
      } else {
        // Click an answer
        await clickAnswerInSequence();
      }
    }

    // Wait for results screen
    console.log('\nWaiting for results screen...');
    await new Promise(r => setTimeout(r, 2000));

    allText = await page.evaluate(() => document.body.innerText);
    console.log('\nResults screen text:\n', allText.substring(0, 1000));

    // Get all buttons
    console.log('\nAll buttons on results screen:');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      console.log(`- "${text.trim()}"`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugApp();
