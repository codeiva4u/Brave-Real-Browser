const launcher = require('brave-real-launcher');

(async () => {
    try {
        console.log('Fetching dynamic User Agents...');
        const agents = await launcher.getDynamicUserAgents();
        console.log('Dynamic User Agents:', JSON.stringify(agents, null, 2));

        console.log('Checking fallback/latest version...');
        const version = await launcher.getLatestChromeVersion();
        console.log('Version:', version);

    } catch (err) {
        console.error('Error:', err);
    }
})();
