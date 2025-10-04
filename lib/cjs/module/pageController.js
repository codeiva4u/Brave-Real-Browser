const { createCursor } = require('ghost-cursor');
const { checkTurnstile } = require('./turnstile.js');
const kill = require('tree-kill');

// Configuration constants
const TURNSTILE_CHECK_INTERVAL = 1000; // 1 second
const TURNSTILE_MAX_ATTEMPTS = 300; // 5 minutes max (300 attempts * 1 second)
const TURNSTILE_TIMEOUT = 300000; // 5 minutes in milliseconds

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function pageController({ browser, page, proxy, turnstile, xvfbsession, pid, plugins, killProcess = false, chrome }) {

    let solveStatus = turnstile;
    let turnstileSolverRunning = false;

    // Safe cleanup function
    const cleanup = async () => {
        solveStatus = false;
        if (killProcess === true) {
            if (xvfbsession) {
                try { 
                    xvfbsession.stopSync();
                } catch (err) { 
                    console.error('Error stopping Xvfb session:', err.message);
                }
            }
            if (chrome) {
                try { 
                    chrome.kill();
                } catch (err) { 
                    console.error('Error killing Chrome process:', err.message);
                }
            }
            if (pid) {
                try { 
                    kill(pid, 'SIGKILL', (err) => {
                        if (err) console.error('Error killing process:', err.message);
                    });
                } catch (err) { 
                    console.error('Error in kill command:', err.message);
                }
            }
        }
    };

    page.on('close', () => {
        solveStatus = false;
    });

    browser.on('disconnected', async () => {
        await cleanup();
    });

    // Enhanced turnstile solver with timeout and max attempts protection
    async function turnstileSolver() {
        if (turnstileSolverRunning) {
            console.warn('Turnstile solver already running, skipping duplicate start');
            return;
        }
        
        turnstileSolverRunning = true;
        const startTime = Date.now();
        let attempts = 0;

        try {
            while (solveStatus && attempts < TURNSTILE_MAX_ATTEMPTS) {
                // Check timeout
                if (Date.now() - startTime > TURNSTILE_TIMEOUT) {
                    console.warn('Turnstile solver timeout reached after', attempts, 'attempts');
                    break;
                }

                // Check if page is still valid
                if (page.isClosed()) {
                    console.log('Page closed, stopping turnstile solver');
                    break;
                }

                attempts++;

                try {
                    await checkTurnstile({ page });
                } catch (err) {
                    // Silent fail for individual checks, log only if debug enabled
                    if (process.env.DEBUG === 'true') {
                        console.debug('Turnstile check failed:', err.message);
                    }
                }

                // Wait before next check
                await new Promise(r => setTimeout(r, TURNSTILE_CHECK_INTERVAL));
            }

            if (attempts >= TURNSTILE_MAX_ATTEMPTS) {
                console.warn('Turnstile solver stopped: max attempts reached');
            }
        } catch (err) {
            console.error('Error in turnstile solver:', err.message);
        } finally {
            turnstileSolverRunning = false;
        }
    }

    // Start turnstile solver only if enabled
    if (turnstile) {
        turnstileSolver().catch(err => {
            console.error('Failed to start turnstile solver:', err.message);
        });
    }

    // Proxy authentication with error handling
    if (proxy && proxy.username && proxy.password) {
        try {
            await page.authenticate({ 
                username: proxy.username, 
                password: proxy.password 
            });
        } catch (err) {
            console.error('Proxy authentication failed:', err.message);
            throw new Error(`Failed to authenticate proxy: ${err.message}`);
        }
    }

    // Plugin initialization with error handling
    if (plugins && plugins.length > 0) {
        for (const plugin of plugins) {
            try {
                if (plugin && typeof plugin.onPageCreated === 'function') {
                    await plugin.onPageCreated(page);
                }
            } catch (err) {
                console.error('Plugin initialization failed:', err.message);
                // Continue with other plugins even if one fails
            }
        }
    }

    // Mouse event handling with error handling
    try {
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(MouseEvent.prototype, 'screenX', {
                get: function () {
                    return this.clientX + window.screenX;
                }
            });

            Object.defineProperty(MouseEvent.prototype, 'screenY', {
                get: function () {
                    return this.clientY + window.screenY;
                }
            });
        });
    } catch (err) {
        console.error('Failed to setup mouse event handlers:', err.message);
        // Non-critical, continue anyway
    }

    // Cursor setup with error handling
    try {
        const cursor = createCursor(page);
        page.realCursor = cursor;
        page.realClick = cursor.click;
    } catch (err) {
        console.error('Failed to create ghost cursor:', err.message);
        // Non-critical, continue anyway
    }

    return page;
}

module.exports = { pageController }