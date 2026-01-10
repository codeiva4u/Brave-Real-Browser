import { createCursor } from 'ghost-cursor';
import { checkTurnstile } from './turnstile.mjs';
import kill from 'tree-kill';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function pageController({ browser, page, proxy, turnstile, xvfbsession, pid, plugins, killProcess = false, brave }) {

    let solveStatus = turnstile

    page.on('close', () => {
        solveStatus = false
    });


    browser.on('disconnected', async () => {
        solveStatus = false
        if (killProcess === true) {
            if (xvfbsession) try { xvfbsession.stopSync() } catch (err) { }
            if (brave) try { brave.kill() } catch (err) { console.log(err); }
            if (pid) try { kill(pid, 'SIGKILL', () => { }) } catch (err) { }
        }
    });

    async function turnstileSolver() {
        while (solveStatus) {
            await checkTurnstile({ page }).catch(() => { });
            await new Promise(r => setTimeout(r, 1000));
        }
        return
    }

    turnstileSolver()

    if (proxy.username && proxy.password) await page.authenticate({ username: proxy.username, password: proxy.password });

    if (plugins.length > 0) {
        for (const plugin of plugins) {
            plugin.onPageCreated(page)
        }
    }

    // 🛡️ COMPREHENSIVE STEALTH INJECTION - For Brotector/Datadome bypass
    await page.evaluateOnNewDocument(() => {
        // ============ NAVIGATOR WEBDRIVER ELIMINATION ============
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
            configurable: true
        });

        // Delete webdriver from Object.getOwnPropertyDescriptor
        const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        Object.getOwnPropertyDescriptor = function (obj, prop) {
            if (obj === navigator && prop === 'webdriver') return undefined;
            return originalGetOwnPropertyDescriptor.apply(this, arguments);
        };

        // ============ PLUGINS & MIME TYPES ============
        Object.defineProperty(navigator, 'plugins', {
            get: () => {
                const plugins = [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
                ];
                plugins.length = 3;
                plugins.item = i => plugins[i];
                plugins.namedItem = n => plugins.find(p => p.name === n);
                plugins.refresh = () => { };
                return plugins;
            },
            configurable: true
        });

        Object.defineProperty(navigator, 'mimeTypes', {
            get: () => {
                const mimeTypes = [
                    { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
                    { type: 'text/pdf', suffixes: 'pdf', description: '' }
                ];
                mimeTypes.length = 2;
                mimeTypes.item = i => mimeTypes[i];
                mimeTypes.namedItem = n => mimeTypes.find(m => m.type === n);
                return mimeTypes;
            },
            configurable: true
        });

        // ============ LANGUAGES ============
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
            configurable: true
        });

        // ============ CHROME RUNTIME REMOVAL ============
        if (window.chrome) {
            const originalChrome = window.chrome;
            window.chrome = new Proxy(originalChrome, {
                get(target, prop) {
                    if (prop === 'runtime') return undefined;
                    if (prop === 'csi') return undefined;
                    if (prop === 'loadTimes') return undefined;
                    return Reflect.get(target, prop);
                }
            });
        }

        // ============ PERMISSIONS API ============
        if (navigator.permissions) {
            const originalQuery = navigator.permissions.query.bind(navigator.permissions);
            navigator.permissions.query = (params) => {
                if (params.name === 'notifications') {
                    return Promise.resolve({ state: 'prompt', onchange: null });
                }
                return originalQuery(params);
            };
        }

        // ============ AUTOMATION SIGNATURES REMOVAL ============
        const automationProps = [
            '__puppeteer__', 'puppeteer', '__playwright__', 'playwright',
            '__selenium_unwrapped', '__selenium_evaluate', '__webdriver_evaluate',
            '__driver_evaluate', '_phantom', '__nightmare', 'callPhantom',
            '__webdriver_script_fn', '__webdriver_script_func', 'cdc_adoQpoasnfa76pfcZLmcfl_Array',
            'cdc_adoQpoasnfa76pfcZLmcfl_Promise', 'cdc_adoQpoasnfa76pfcZLmcfl_Symbol'
        ];
        automationProps.forEach(prop => {
            try { delete window[prop]; } catch (e) { }
        });

        // ============ ERROR STACK SANITIZATION ============
        const originalError = Error;
        window.Error = function (...args) {
            const error = new originalError(...args);
            if (error.stack) {
                error.stack = error.stack.split('\\n')
                    .filter(line => !line.includes('puppeteer') && !line.includes('playwright') && !line.includes('UtilityScript'))
                    .join('\\n');
            }
            return error;
        };
        window.Error.prototype = originalError.prototype;

        // ============ HARDWARE SPOOFING ============
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

        // ============ CONNECTION API ============
        if (navigator.connection) {
            Object.defineProperty(navigator.connection, 'rtt', { get: () => 50 });
            Object.defineProperty(navigator.connection, 'downlink', { get: () => 10 });
            Object.defineProperty(navigator.connection, 'effectiveType', { get: () => '4g' });
        }
    });

    // MouseEvent screenX/screenY fix
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

    const cursor = createCursor(page);
    page.realCursor = cursor
    page.realClick = cursor.click
    return page
}