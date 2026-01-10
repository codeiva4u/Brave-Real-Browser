const { connect } = require('../lib/cjs/index.js');

(async () => {
    try {
        console.log('Connecting to browser (HEADED)...');
        const { page, browser } = await connect({
            headless: false,
            args: [],
            customConfig: {},
            turnstile: true,
            connectOption: {},
            disableXvfb: false,
            ignoreAllFlags: false
        });

        console.log('Checking navigator properties...');
        const ua = await page.evaluate(() => navigator.userAgent);
        const appVersion = await page.evaluate(() => navigator.appVersion);
        const platform = await page.evaluate(() => navigator.platform);
        const uaData = await page.evaluate(() => navigator.userAgentData ? navigator.userAgentData.brands : 'Not Supported');

        console.log('User Agent:', ua);
        console.log('App Version:', appVersion);
        console.log('Platform:', platform);
        console.log('UA Data:', JSON.stringify(uaData, null, 2));

        await browser.close();
        console.log('Browser closed.');
    } catch (err) {
        console.error('Error:', err);
    }
})();
