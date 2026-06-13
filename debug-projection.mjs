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

    // Complete the questionnaire
    console.log('Completing questionnaire...');
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

    // Wait for results screen
    await new Promise(r => setTimeout(r, 2000));

    // Get all button texts
    console.log('\nAll buttons on results screen:');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      console.log(`- "${text.trim()}"`);
    }

    // Get all visible text on page
    console.log('\nPage content (first 500 chars):');
    const content = await page.content();
    console.log(content.substring(0, 1000));

    // Try to save a screenshot
    await page.screenshot({ path: '/tmp/results-screen.png' });
    console.log('\nScreenshot saved to /tmp/results-screen.png');

    // Look for projection button specifically
    console.log('\nSearching for projection button...');
    const allText = await page.evaluate(() => document.body.innerText);
    console.log(allText);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugApp();
