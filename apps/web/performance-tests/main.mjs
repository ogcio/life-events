import puppeteer from 'puppeteer';
import { runLighthouseForURL } from './runLighthouse.mjs';
import * as chromeLauncher from 'chrome-launcher';
import  util from 'util'
import request from 'request'

const environment = process.env.environment || 'https://dev.life.gov.ie';

async function main () {

const loginURL = environment
const eventPage = loginURL + '/en/events'
const consentPage = loginURL + '/en/welcome'
const beforeYouStart = loginURL + '/en/digital-wallet/get-digital-wallet/before-you-start'
const governmentDetails = loginURL + '/en/digital-wallet/get-digital-wallet/government-details'
const deviceSelection = loginURL + '/en/digital-wallet//get-digital-wallet/device-selection'
const deviceDetails = loginURL + '/en/digital-wallet//get-digital-wallet/your-device'
const checkDetails = loginURL + '/en/digital-wallet//get-digital-wallet/check-details'
const changeDetails = loginURL + '/en/digital-wallet//get-digital-wallet/change-details'
const applicationSuccess = loginURL + '/en/digital-wallet//get-digital-wallet/application-success'
const adminPage = loginURL + '/en/admin/submissions'


const opts = {
  // chromeFlags: ['--headless'],
  output: 'json',
  disableDeviceEmulation: true,
  defaultViewport: {
    width: 1200,
    height: 900
  },
  chromeFlags: ['--disable-mobile-emulation'],
}

  // Launch chrome using chrome-launcher
  const chrome = await chromeLauncher.launch(opts)
  opts.port = chrome.port

  // Connect to it using puppeteer.connect().
  const resp = await util.promisify(request)(`http://localhost:${opts.port}/json/version`)
  const { webSocketDebuggerUrl } = JSON.parse(resp.body)
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl })

  // Puppeteer
  const page = (await browser.pages())[0]
  await page.setViewport({ width: 1200, height: 900 })
  await page.goto(loginURL, { waitUntil: 'networkidle0' })
  await page.type('#login-form > div:nth-child(2) > div:nth-child(5) > input', '123')
  await page.evaluate(() => {
    document.querySelector('#submit_btn').click()
  })

  await page.waitForSelector('#consent', { visible: true, timeout: 0 })

    // Run Lighthouse.
    await runLighthouseForURL(consentPage, opts, 'consent-page').then(results => {
      return results
    })

  await page.evaluate(() => {
    document.querySelector('#consent').click()
  })
  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > main > div > form > button').click()
  })

  await page.waitForNavigation()

  // Run Lighthouse.
  await runLighthouseForURL(eventPage, opts, 'events-page').then(results => {
    return results
  })

  //await page.goto(eventPage, { waitUntil: 'networkidle0' })

  await page.click('body > main > div:nth-child(2) > div > main > div > section:nth-child(1) > ul > li > div > div:nth-child(1) > a')

  await page.waitForNavigation()

  // Run Lighthouse.
  await runLighthouseForURL(beforeYouStart, opts, 'digital-wallet-before-you-start').then(results => {
    return results
  })

  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > form > button').click()
  })

  await page.waitForNavigation()

  await runLighthouseForURL(governmentDetails, opts, 'digital-wallet-government-details').then(results => {
    return results
  })

  await page.type('#govIEEmail', 'test@gov.ie')
  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > form > button').click()
  })

  await page.waitForNavigation()

  await runLighthouseForURL(deviceSelection, opts, 'digital-wallet-device-selection').then(results => {
    return results
  })

  await page.evaluate(() => {
    document.querySelector('#device-type-0').click()
  })
  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > form > button').click()
  })

  await page.waitForNavigation()

  await runLighthouseForURL(deviceDetails, opts, 'digital-wallet-device-details').then(results => {
    return results
  })

  await page.type('#appStoreEmail', 'test@test.com')
  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > form > button').click()
  })

  await page.waitForNavigation()

  await runLighthouseForURL(checkDetails, opts, 'digital-wallet-check-details').then(results => {
    return results
  })

  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > dl:nth-child(5) > div:nth-child(1) > dd.govie-summary-list__actions > a').click()
  })

  await page.waitForNavigation()

  await runLighthouseForURL(changeDetails, opts, 'digital-wallet-change-details').then(results => {
    return results
  })

  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > form > button').click()
  })

  await page.waitForSelector('body > main > div:nth-child(2) > div.govie-grid-row > div > dl:nth-child(5) > div:nth-child(1) > dd.govie-summary-list__actions > a', { visible: true, timeout: 0 })

  await page.evaluate(() => {
    document.querySelector('body > main > div:nth-child(2) > div.govie-grid-row > div > form > button').click()
  })

  await page.waitForNavigation()

  await runLighthouseForURL(applicationSuccess, opts, 'digital-wallet-application-success').then(results => {
    return results
  })

  await page.evaluate(() => {
    document.querySelector('body > header > div > div.Header_headerRightContainer__Dt9aV > a > span').click()
  })

  await page.waitForNavigation()

  await page.goto(loginURL, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
    document.querySelector('#login-form > div:nth-child(1) > label:nth-child(1) > input[type=checkbox]').click()
  })
  await page.type('#login-form > div:nth-child(2) > div:nth-child(5) > input', '123')
        await page.evaluate(() => {
        document.querySelector('#submit_btn').click()
        })

  await page.waitForSelector('body > main > div:nth-child(2) > nav > div:nth-child(2) > a', { visible: true, timeout: 0 })

  await runLighthouseForURL(adminPage, opts, 'admin-submissions').then(results => {
    return results
  })
  
  await browser.disconnect()
  await chrome.kill()

}

await main ()