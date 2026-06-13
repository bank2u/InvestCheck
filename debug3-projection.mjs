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

    // Answer all 10 questions
    console.log('Answering all 10 questions...');
    let totalAnswered = 0;
    for (let attempt = 0; attempt < 25 && totalAnswered < 10; attempt++) {
      const buttons = await page.$$('button');
      let answered = false;

      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text.includes('ถัดไป') || text.includes('ทำแบบทดสอบใหม่') || text.includes('ลงทุน')) {
          continue;
        }

        const isClickable = await page.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.opacity !== '0';
        }, btn);

        if (isClickable && text.trim().length > 0) {
          console.log(`  Q${totalAnswered + 1}: "${text.trim()}"`);
          await btn.click();
          await new Promise(r => setTimeout(r, 300));
          totalAnswered++;
          answered = true;
          break;
        }
      }

      if (!answered) {
        break;
      }
    }

    console.log(`\nAnswered ${totalAnswered} questions`);
    await new Promise(r => setTimeout(r, 2000));

    // Get all text on the page
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('\n\nCurrent page text (first 2000 chars):');
    console.log(pageText.substring(0, 2000));
    console.log('\n\n--- More content ---\n');
    console.log(pageText.substring(2000, 4000));

    // Check for specific keywords
    console.log('\n\nKeyword search:');
    console.log('Contains "ผล":', pageText.includes('ผล'));
    console.log('Contains "การจัดสรร":', pageText.includes('การจัดสรร'));
    console.log('Contains "คำแนะนำ":', pageText.includes('คำแนะนำ'));
    console.log('Contains "ลงทุน":', pageText.includes('ลงทุน'));
    console.log('Contains "บาท":', pageText.includes('บาท'));
    console.log('Contains "ข้อที่":', pageText.includes('ข้อที่'));

    // Check current screen
    const currentScreen = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/ข้อที่ (\d+) จาก 10/);
      if (match) {
        return `Question ${match[1]} screen`;
      }
      return 'Results screen or unknown';
    });
    console.log('\nCurrent screen:', currentScreen);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/debug-final.png' });
    console.log('\nScreenshot saved to /tmp/debug-final.png');

    // List all buttons
    console.log('\nAll buttons:');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent.trim(), btn);
      console.log(`- "${text}"`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugApp();
