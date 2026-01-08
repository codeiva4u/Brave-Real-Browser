const test = require('node:test');
const assert = require('node:assert');
const { connect } = require('../../lib/cjs/index.js');

const realBrowserOption = {
    turnstile: true,
    headless: false,
    customConfig: {},
    plugins: []
}

// Shared browser instance for all tests
let browser = null;
let page = null;

// Setup - Run once before all tests
test.before(async () => {
    console.log('🚀 Starting browser for all tests...');
    const result = await connect(realBrowserOption);
    browser = result.browser;
    page = result.page;
    console.log('✅ Browser started successfully');
});

// Teardown - Run once after all tests
test.after(async () => {
    console.log('🏁 Closing browser after all tests...');
    if (browser) {
        await browser.close();
        console.log('✅ Browser closed successfully');
    }
});

test('DrissionPage Detector', async () => {
    await page.goto("https://web.archive.org/web/20240913054632/https://drissionpage.pages.dev/");
    await page.realClick("#detector")
    let result = await page.evaluate(() => { return document.querySelector('#isBot span').textContent.includes("not") ? true : false })
    assert.strictEqual(result, true, "DrissionPage Detector test failed!")
})

test('Brotector, a webdriver detector', async () => {
    await page.goto("https://kaliiiiiiiiii.github.io/brotector/");
    await new Promise(r => setTimeout(r, 3000));
    let result = await page.evaluate(() => { return document.querySelector('#table-keys').getAttribute('bgcolor') })
    assert.strictEqual(result === "darkgreen", true, "Brotector, a webdriver detector test failed!")
})

test('Cloudflare WAF', async () => {
    await page.goto("https://nopecha.com/demo/cloudflare");
    let verify = null
    let startDate = Date.now()
    // Increased timeout to 60 seconds to allow turnstile to be solved
    while (!verify && (Date.now() - startDate) < 60000) {
        verify = await page.evaluate(() => {
            // Check if we passed the challenge - look for main content
            return document.querySelector('.link_row') || document.querySelector('a[href*="nopecha"]') ? true : null
        }).catch(() => null)
        await new Promise(r => setTimeout(r, 2000));
    }
    assert.strictEqual(verify === true, true, "Cloudflare WAF test failed! (Site may be blocking automated access)")
})


test('Cloudflare Turnstile', async () => {
    await page.goto("https://2captcha.com/demo/cloudflare-turnstile");
    await page.waitForSelector('.cf-turnstile')
    let token = null
    let startDate = Date.now()
    while (!token && (Date.now() - startDate) < 30000) {
        token = await page.evaluate(() => {
            try {
                let item = document.querySelector('[name="cf-turnstile-response"]')?.value
                return item && item.length > 20 ? item : null
            } catch (e) {
                return null
            }
        })
        await new Promise(r => setTimeout(r, 1000));
    }
    assert.strictEqual(token !== null, true, "Cloudflare turnstile test failed!")
})


test('Fingerprint JS Bot Detector', async () => {
    await page.goto("https://fingerprint.com/products/bot-detection/");
    await new Promise(r => setTimeout(r, 8000));
    const detect = await page.evaluate(() => {
        // Check in pre/code blocks for notDetected result or in page text
        const preElements = document.querySelectorAll('pre, code');
        for (const el of preElements) {
            if (el.textContent.includes('notDetected') || el.textContent.includes('"result": "notDetected"')) {
                return true;
            }
        }
        // Fallback: check any element with partial class match
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
            for (const cls of el.classList) {
                if (cls.includes('botSubTitle') && el.textContent.toLowerCase().includes('not')) {
                    return true;
                }
            }
        }
        return false;
    })
    assert.strictEqual(detect, true, "Fingerprint JS Bot Detector test failed!")
})


// If you fail this test, your ip address probably has a high spam score. Please use a mobile or clean ip address.
test('Datadome Bot Detector', async (t) => {
    await page.goto("https://antoinevastel.com/bots/datadome");
    const check = await page.waitForSelector('nav #navbarCollapse').catch(() => null)
    assert.strictEqual(check ? true : false, true, "Datadome Bot Detector test failed! [This may also be because your ip address has a high spam score. Please try with a clean ip address.]")
})

// If this test fails, please first check if you can access https://antcpt.com/score_detector/
test('Recaptcha V3 Score (hard)', async () => {
    await page.goto("https://antcpt.com/score_detector/");
    await page.realClick("button")
    await new Promise(r => setTimeout(r, 5000));
    const score = await page.evaluate(() => {
        return document.querySelector('big').textContent.replace(/[^0-9.]/g, '')
    })
    assert.strictEqual(Number(score) >= 0.7, true, "(please first check if you can access https://antcpt.com/score_detector/.) Recaptcha V3 Score (hard) should be >=0.7. Score Result: " + score)
})