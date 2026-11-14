import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import http from 'http';

const safeRealpath = (p) => {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
};
fs.promises.realpath = async (p) => safeRealpath(p);
fs.realpathSync = safeRealpath;
if (fs.realpathSync.native) fs.realpathSync.native = safeRealpath;
if (fs.promises.realpath.native) fs.promises.realpath.native = async (p) => safeRealpath(p);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function waitForServer(port) {
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/dashboard`, resolve);
        req.on('error', reject);
        req.setTimeout(2000, () => req.abort());
      });
      if (res.statusCode) {
        console.log(`Server ready on port ${port} (status: ${res.statusCode})`);
        return true;
      }
    } catch (e) {
      // still starting
    }
  }
  throw new Error('Server start timed out');
}

async function waitForChrome(port) {
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/version`, resolve).on('error', reject);
      });
      if (res.statusCode === 200) {
        console.log('Chrome CDP ready on port', port);
        return true;
      }
    } catch (e) {}
  }
  throw new Error('Chrome CDP start timed out');
}

async function run() {
  const patchScript = path.resolve('scripts/sandbox-patch.js');
  fs.writeFileSync(patchScript, `
const fs = require('fs');
const path = require('path');
const safeRealpath = (p) => {
  try { return fs.realpathSync(p); } catch { return path.resolve(p); }
};
fs.promises.realpath = async (p) => safeRealpath(p);
fs.realpathSync = safeRealpath;
if (fs.realpathSync.native) fs.realpathSync.native = safeRealpath;
if (fs.promises.realpath.native) fs.promises.realpath.native = async (p) => safeRealpath(p);
  `.trim());

  console.log('Starting Next.js dev server...');
  const nextProcess = spawn(
    process.execPath,
    ['--require', patchScript, './node_modules/next/dist/bin/next', 'dev', '-p', '3005'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  nextProcess.stdout.on('data', (d) => process.stdout.write(d.toString()));
  nextProcess.stderr.on('data', (d) => process.stderr.write(d.toString()));

  const cdpPort = 9222;
  const userDataDir = path.resolve('.chrome-temp-user-data');
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ]);

  try {
    await waitForServer(3005);
    await waitForChrome(cdpPort);

    const targets = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${cdpPort}/json`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });

    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.onopen = resolve);

    let id = 1;
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const reqId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === reqId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });

    const consoleLogs = [];
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        if (msg.params.type === 'error') {
          console.error('[Browser Error]', text);
          consoleLogs.push({ type: 'error', text });
        }
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    // Set guest cookie to authenticate dashboard
    await send('Network.setCookie', {
      name: 'hisabdo_guest',
      value: 'true',
      domain: '127.0.0.1',
      path: '/',
    });
    await send('Network.setCookie', {
      name: 'hisabdo_auth_token',
      value: 'guest-token',
      domain: '127.0.0.1',
      path: '/',
    });

    const captureScenario = async (filename, setupFn, width = 1280, height = 950) => {
      console.log(`\n--- Capturing ${filename} (${width}x${height}) ---`);
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });

      await send('Page.navigate', { url: 'http://127.0.0.1:3005/dashboard' });
      // wait for page render
      await new Promise((r) => setTimeout(r, 4000));

      if (setupFn) {
        await send('Runtime.evaluate', { expression: `(${setupFn.toString()})()` });
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Check for horizontal overflow
      const overflowCheck = await send('Runtime.evaluate', {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`,
        returnByValue: true,
      });
      console.log(`Overflow check for ${filename}:`, overflowCheck?.result?.value);

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.resolve('screenshots', filename), Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: screenshots/${filename} (${(shot.data.length * 0.75 / 1024).toFixed(1)} KB)`);
    };

    // 1. Light mode
    await captureScenario('dashboard-light.png', () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem('hisabdo_theme', 'light');
    });

    // 2. Dark mode
    await captureScenario('dashboard-dark.png', () => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem('hisabdo_theme', 'dark');
    });

    // 3. Mobile 360px (Dark)
    await captureScenario(
      'dashboard-mobile-360px.png',
      () => {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('dir', 'ltr');
      },
      360,
      900
    );

    // 4. RTL Urdu
    await captureScenario('dashboard-rtl.png', () => {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ur');
      localStorage.setItem('hisabdo_lang', 'ur');
    });

    console.log('\nConsole error count during run:', consoleLogs.length);
    ws.close();
    console.log('All screenshots captured successfully!');
  } finally {
    try { chrome.kill(); } catch {}
    try { nextProcess.kill(); } catch {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
    try { fs.unlinkSync(patchScript); } catch {}
  }
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
