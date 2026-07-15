const puppeteer = require('puppeteer');
const http = require('http');

(async () => {
    // Start server
    const server = require('./server.js'); // server.js starts listening automatically
    
    // Wait a bit for server to start
    await new Promise(r => setTimeout(r, 1000));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    await page.goto('http://localhost:3000/#python');
    
    // Wait for pyodide to be ready
    await new Promise(r => setTimeout(r, 3000));
    
    // Click run button
    await page.click('#btn-py-run');
    
    // Wait for prompt to appear
    await new Promise(r => setTimeout(r, 2000));
    
    // Type something in terminal
    await page.keyboard.type('Ilyas\n');

    // Wait for execution to finish
    await new Promise(r => setTimeout(r, 2000));
    
    // Get terminal output
    const terminalOutput = await page.evaluate(() => {
        return document.querySelector('.xterm-rows').innerText;
    });
    console.log('TERMINAL OUTPUT:\n', terminalOutput);
    
    await browser.close();
    process.exit(0);
})();
