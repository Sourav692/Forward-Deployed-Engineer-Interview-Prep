const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');

const file = process.argv[2];
const outIndex = process.argv.indexOf('--out');
const out = outIndex >= 0 ? process.argv[outIndex + 1] : 'browser-check.json';
if (!file) throw new Error('Usage: node check_browser.cjs CASE/index.html --out report.json');
let puppeteer;
try { puppeteer = require(process.env.PUPPETEER_MODULE || 'puppeteer-core'); }
catch { throw new Error('Set PUPPETEER_MODULE to an installed puppeteer-core module path.'); }
const chrome = process.env.CHROME_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].find(candidate => fs.existsSync(candidate));
if (!chrome) throw new Error('Set CHROME_PATH to an installed Chrome or Chromium executable.');
const report = {passed: false, widths: [320,390,834,1280,1440,1920], checks: [], errors: []};
const check = label => report.checks.push(label);

(async () => {
  fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
  const shots = path.join(path.dirname(path.resolve(out)), 'browser-screens');
  fs.mkdirSync(shots, {recursive: true});
  const browser = await puppeteer.launch({executablePath: chrome, headless: true});
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    const networkAssets = [];
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (/^https?:/.test(request.url())) {
        networkAssets.push(request.url());
        request.abort();
      } else request.continue();
    });
    const base = pathToFileURL(path.resolve(file)).href;
    await page.setViewport({width:1440,height:900});
    await page.goto(base, {waitUntil:'networkidle0'});
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(()=>[...document.fonts].some(font=>font.status==='error')),false,'A bundled font failed to load');
    assert.equal(await page.$$eval('main > .panel', elements => elements.length), 5);
    assert.equal(await page.$$eval('.panel:not([hidden])', elements => elements.length), 1);
    check('Five primary sections and progressive enhancement');
    await page.focus('.section-nav a');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.panelLink),'walkthrough');
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>!document.getElementById('walkthrough').hidden);
    await page.goto(base+'#deep-dives');
    const summary=await page.$('#deep-dives > details > summary');
    if(summary){
      const wasOpen=await summary.evaluate(element=>element.parentElement.open);
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.equal(await summary.evaluate(element=>element.parentElement.open),!wasOpen);
    }
    check('Keyboard navigation and native disclosure activation');
    await page.goto(base);
    await page.screenshot({path:path.join(shots,'desktop.png')});
    for (const width of report.widths) {
      await page.setViewport({width,height:900});
      for (const id of ['case-brief','walkthrough','deep-dives','practice','quick-review']) {
        await page.evaluate(id => {location.hash=id;},id);
        await page.waitForFunction(id => !document.getElementById(id).hidden,{},id);
        await page.evaluate(id => document.getElementById(id).querySelectorAll('details').forEach(element=>{element.open=true;}),id);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow: ${width}px ${id}`);
      }
    }
    check('30 responsive section checks with all disclosures expanded');
    const originalIds = await page.$$eval('[data-source-id]', elements => elements.map(element=>element.id));
    for (const id of originalIds) {
      await page.evaluate(id=>{location.hash=id;},id);
      await page.waitForFunction(id=>{
        const target=document.getElementById(id);
        if(!target || !target.getClientRects().length) return false;
        let parent=target.parentElement;
        while(parent){if(parent.tagName==='DETAILS'&&!parent.open)return false;parent=parent.parentElement;}
        return true;
      },{},id);
    }
    check(`${originalIds.length} retained source fragments and containing disclosures`);
    await page.evaluate(async()=>{
      const images=[...document.querySelectorAll('img')];
      images.forEach(image=>{image.loading='eager';});
      await Promise.all(images.map(image=>image.decode()));
    });
    check('All image payloads decode offline');
    await page.goto(base+'#walkthrough');
    await page.click('[data-mark-read="walkthrough"]');
    assert.match(await page.$eval('#read-progress',element=>element.textContent),/1 of 3/);
    await page.reload();
    assert.match(await page.$eval('#read-progress',element=>element.textContent),/1 of 3/);
    await page.click('[data-mark-read="walkthrough"]');
    assert.match(await page.$eval('#read-progress',element=>element.textContent),/0 of 3/);
    check('Persistent and reversible reading progress');
    await page.goto(base+'#practice');
    const answers=await page.$$eval('#practice details[data-worked-answer]',elements=>elements.map(element=>element.id));
    assert.ok(answers.length,'Practice has no worked-answer reveal beyond its rubric');
    for(const id of answers){
      await page.$eval('#'+id,element=>{element.open=false;});
      await page.focus('#'+id+' > summary');
      await page.keyboard.press('Enter');
      assert.equal(await page.$eval('#'+id,element=>element.open),true);
    }
    check(`${answers.length} worked-answer reveals accessible by keyboard`);
    await page.click('#mark-attempted');
    assert.match(await page.$eval('#notes-status',element=>element.textContent),/Write some notes/);
    const firstField=await page.$eval('textarea[data-note]',element=>element.id);
    await page.type('#'+firstField,'A case-specific browser-check draft.');
    await page.waitForFunction(()=>document.getElementById('notes-status').textContent.includes('saved'));
    await page.click('#mark-attempted');
    assert.equal(await page.$eval('#practice-state',element=>element.textContent),'Attempted');
    await page.click('#practice-rubric summary');
    await page.click('input[name="rubric"]');
    await page.reload();
    assert.match(await page.$eval('#'+firstField,element=>element.value),/browser-check draft/);
    assert.equal(await page.$eval('input[name="rubric"]',element=>element.checked),true);
    check('Notes, attempt validation, independent practice status, and rubric persistence');
    const client=await page.createCDPSession();
    const downloads=path.join(path.dirname(path.resolve(out)),'browser-downloads');
    fs.mkdirSync(downloads,{recursive:true});
    await client.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
    const exported=path.join(downloads,await page.$eval('#case-config',element=>JSON.parse(element.textContent).slug)+'-notes.md');
    if(fs.existsSync(exported)) fs.unlinkSync(exported);
    await page.click('#export-notes');
    await new Promise(resolve=>setTimeout(resolve,400));
    assert.match(fs.readFileSync(exported,'utf8'),/browser-check draft/);
    check('Case-specific Markdown export');
    await page.goto(base+'#quick-review');
    await page.emulateMediaType('print');
    assert.equal(await page.$eval('#quick-review',element=>getComputedStyle(element).display),'block');
    assert.equal(await page.$eval('.section-nav',element=>getComputedStyle(element).display),'none');
    await page.pdf({path:path.join(shots,'quick-review.pdf'),format:'A4',margin:{top:'12mm',right:'12mm',bottom:'12mm',left:'12mm'}});
    await page.emulateMediaType('screen');
    check('Quick review print layout');
    await page.setViewport({width:390,height:844});
    await page.goto(base);
    await page.evaluate(async()=>{
      const images=[...document.querySelectorAll('img')];
      images.forEach(image=>{image.loading='eager';});
      await Promise.all(images.map(image=>image.decode()));
    });
    await page.screenshot({path:path.join(shots,'phone.png'),fullPage:true});
    await page.evaluate(()=>localStorage.clear());
    await page.setJavaScriptEnabled(false);
    await page.goto(base);
    assert.equal(await page.$$eval('.panel',elements=>elements.filter(element=>getComputedStyle(element).display!=='none').length),5);
    check('All five sections readable without JavaScript');
    await page.setJavaScriptEnabled(true);
    await page.evaluateOnNewDocument(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
    await page.goto(base+'?storage=blocked#practice');
    assert.match(await page.$eval('#storage-status',element=>element.textContent),/unavailable/);
    await page.type('#'+firstField,'Editable without storage.');
    await page.click('#mark-attempted');
    assert.equal(await page.$eval('#practice-state',element=>element.textContent),'Attempted');
    check('Unavailable-storage fallback');
    assert.deepEqual(report.errors,[]);
    assert.deepEqual(networkAssets,[],'Offline reader attempted network asset requests');
    report.passed=true;
  } finally { await browser.close(); }
})().catch(error=>{report.errors.push(error.stack);process.exitCode=1;}).finally(()=>{
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
});
