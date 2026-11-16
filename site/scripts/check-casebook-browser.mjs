/** Native-route and production checks. Set PUPPETEER_MODULE and optionally CHROME_PATH. */
import { createRequire } from 'node:module'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import assert from 'node:assert/strict'

const option = (name, fallback) => { const at = process.argv.indexOf(name); return at < 0 ? fallback : process.argv[at + 1] }
const base = option('--base', 'http://localhost:4180').replace(/\/$/, '')
const deployment = option('--deployment', 'local-preview')
const out = resolve(option('--out', '../.website_spec/qa/casebook-readers'))
const require = createRequire(import.meta.url)
const puppeteer = require(process.env.PUPPETEER_MODULE || 'puppeteer-core')
const site = resolve(import.meta.dirname, '..')
const files = (await readdir(join(site, 'content', 'casebooks'))).filter(file => file.endsWith('.json'))
const slugs = option('--slugs', files.map(file => file.replace(/\.json$/, '')).join(',')).split(',')
const widths = [320, 390, 834, 1280, 1440, 1920]
const panels = ['case-brief', 'walkthrough', 'deep-dives', 'practice', 'quick-review']
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
let failed = 0
try {
  for (const slug of slugs) {
    const directory = join(out, slug)
    await mkdir(directory, { recursive: true })
    const url = `${base}/design/${slug}`
    const report = { passed: false, url, deployment, checked_at: new Date().toISOString(), checks: {}, errors: [] }
    const page = await browser.newPage()
    page.on('pageerror', error => report.errors.push(error.message))
    try {
      const payload = JSON.parse(await readFile(join(site, 'content', 'casebooks', `${slug}.json`), 'utf8'))
      await page.setViewport({ width: 1440, height: 900 })
      const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 120_000 })
      assert.equal(response.status(), 200)
      await page.waitForSelector('.casebook-reader.js-enhanced', { timeout: 30_000 })
      assert.equal(await page.$eval('.casebook-reader', element => element.dataset.readerSha), payload.html_sha256, 'Wrong deployed content hash')
      assert.equal(await page.$$eval('main', elements => elements.length), 1, 'Nested main landmark')
      const jump = async hash => page.evaluate(hash => {
        history.replaceState(null, '', `#${hash}`)
        dispatchEvent(new HashChangeEvent('hashchange'))
        return new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))
      }, hash)
      for (const width of widths) {
        await page.setViewport({ width, height: 900 })
        for (const panel of panels) {
          await jump(panel)
          await page.$$eval(`#${panel} details`, items => items.forEach(item => { item.open = true }))
          assert.equal(await page.$$eval('.casebook-reader .panel:not([hidden])', items => items.length), 1)
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${panel} overflows at ${width}`)
        }
        if (width <= 834) assert.equal(await page.$eval('.section-jump', element => getComputedStyle(element).display), 'block')
      }
      report.checks.responsive = { widths, panels: panels.length, expanded_disclosures: true }
      let count = 0
      for (const [from, to] of Object.entries(payload.config.aliases)) {
        await jump(from)
        assert.equal(await page.evaluate(id => {
          const target = document.getElementById(id)
          return !!target?.getClientRects().length && !target.closest('.panel')?.hidden
        }, to), true, `Broken legacy alias #${from}`)
        count++
      }
      report.checks.aliases = count
      assert.equal(await page.$$eval('.casebook-reader img', async images => {
        await Promise.all(images.map(image => image.decode()))
        return images.every(image => image.complete && image.naturalWidth > 0)
      }), true, 'Source figure decode failed')
      report.checks.images = await page.$$eval('.casebook-reader img', images => images.length)
      await page.evaluate(() => {
        URL.originalCreateObjectURL = URL.createObjectURL
        URL.createObjectURL = blob => { window.casebookExportBlob = blob; return URL.originalCreateObjectURL(blob) }
      })
      await jump('practice')
      const input = await page.$('textarea[data-note]')
      await input.evaluate(element => { element.value = 'Native route verification note'; element.dispatchEvent(new Event('input', { bubbles: true })) })
      await page.evaluate(() => document.getElementById('practice-form').requestSubmit())
      assert.equal(await page.$eval('#practice-state', element => element.textContent), 'Attempted')
      await page.click('#export-notes')
      assert.match(await page.evaluate(() => window.casebookExportBlob.text()), /Native route verification note/)
      await page.reload({ waitUntil: 'networkidle0' })
      await page.waitForSelector('.casebook-reader.js-enhanced')
      await jump('practice')
      assert.equal(await page.$eval('textarea[data-note]', element => element.value), 'Native route verification note')
      assert.equal(await page.$eval('#read-progress', element => element.textContent), '0 of 3 reading sections')
      for (const panel of ['walkthrough', 'deep-dives', 'quick-review']) {
        await jump(panel)
        await page.click(`[data-mark-read="${panel}"]`)
      }
      assert.equal(await page.$eval('#read-progress', element => element.textContent), '3 of 3 reading sections')
      await page.click('[data-mark-read="quick-review"]')
      assert.equal(await page.$eval('#read-progress', element => element.textContent), '2 of 3 reading sections')
      await jump('practice')
      const answers = await page.$$('details.answer-reveal, details.source-answer')
      for (const answer of answers) {
        await answer.evaluate(element => { element.open = false })
        await answer.$eval('summary', element => element.focus())
        await page.keyboard.press('Enter')
        assert.equal(await answer.evaluate(element => element.open), true)
      }
      report.checks.interactions = { notes_restored: true, markdown_export: true, separate_practice: true, reversible_reading: true, keyboard_answers: answers.length }
      await jump('case-brief')
      await page.setViewport({ width: 1440, height: 900 })
      await page.evaluate(() => { document.documentElement.classList.remove('dark'); window.scrollTo(0, 0) })
      await page.screenshot({ path: join(directory, 'desktop-light.png') })
      await page.evaluate(() => document.documentElement.classList.add('dark'))
      await page.screenshot({ path: join(directory, 'desktop-dark.png') })
      const dark = await page.$('.source-diagram img.diagram-dark')
      if (dark) assert.equal(await dark.evaluate(element => getComputedStyle(element).display), 'block', 'Dark source figure not shown')
      await page.setViewport({ width: 390, height: 900 })
      await page.screenshot({ path: join(directory, 'phone-dark.png') })
      await page.emulateMediaType('print')
      assert.equal(await page.$eval('#quick-review', element => getComputedStyle(element).display), 'block', 'Quick review hidden in print')
      for (const panel of panels.filter(id => id !== 'quick-review')) assert.equal(await page.$eval(`#${panel}`, element => getComputedStyle(element).display), 'none')
      await page.pdf({ path: join(directory, 'quick-review.pdf'), format: 'A4', printBackground: true })
      await page.emulateMediaType('screen')
      report.checks.theme_and_print = true
      const blocked = await browser.newPage()
      await blocked.evaluateOnNewDocument(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied by test') } }))
      await blocked.goto(url, { waitUntil: 'networkidle0', timeout: 120_000 })
      await blocked.waitForSelector('.casebook-reader.js-enhanced')
      assert.match(await blocked.$eval('#storage-status', element => element.textContent), /unavailable/)
      await blocked.close()
      const plain = await browser.newPage()
      await plain.setJavaScriptEnabled(false)
      await plain.goto(url, { waitUntil: 'networkidle0', timeout: 120_000 })
      assert.equal(await plain.$$eval('.casebook-reader .panel', items => items.filter(element => element.getClientRects().length).length), 5)
      await plain.close()
      report.checks.storage_denied_and_no_script = true
      assert.deepEqual(report.errors, [])
      report.passed = true
    } catch (error) {
      report.errors.push(error.message)
      failed++
    } finally {
      await page.close()
      await writeFile(join(directory, 'live-check.json'), JSON.stringify(report, null, 2) + '\n')
      console.log(`${slug}: ${report.passed ? 'PASS' : 'FAIL'} ${report.errors.join('; ')}`)
    }
  }
} finally { await browser.close() }
if (failed) process.exitCode = 1
