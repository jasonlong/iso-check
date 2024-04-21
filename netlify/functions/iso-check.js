// import { executablePath } from 'puppeteer-core'
import path from 'path'
// import * as Sentry from '@sentry/node'
// import { nodeProfilingIntegration } from '@sentry/profiling-node'
// import chromium from '@sparticuz/chromium-min'
const chromium = require('@sparticuz/chromium-min')
const puppeteer = require('puppeteer-core')

export default async () => {
  // Sentry.init({
  //   dsn: 'https://4d4774df4619bd9abb649cffa13fc2c7@o4507041485946880.ingest.us.sentry.io/4507041490272256',
  //   integrations: [nodeProfilingIntegration()],
  //   tracesSampleRate: 1.0, //  Capture 100% of the transactions
  //   profilesSampleRate: 1.0
  // })

  const validateNumberIsPositive = (number) => {
    try {
      const value = parseInt(number.replaceAll(',', ''))
      if (value <= 0) {
        throw new Error('Number is negative or zero')
      }
    } catch (e) {
      console.error(e)
      // Sentry.captureException(e)
    }
  }

  ;(async () => {
    const pathToExtension = path.join(process.cwd(), 'extension')

    const browser = await puppeteer.launch(
      process.env.NODE_ENV === 'production'
        ? {
            args: [
              ...chromium.args,
              '--hide-scrollbars',
              '--disable-web-security',
              `--disable-extensions-except=${pathToExtension}`,
              `--load-extension=${pathToExtension}`
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(
              `https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar`
            ),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
          }
        : {
            args: [
              ...chromium.args,
              '--hide-scrollbars',
              '--disable-web-security',
              `--disable-extensions-except=${pathToExtension}`,
              `--load-extension=${pathToExtension}`
            ],
            headless: false,
            executablePath: executablePath()
          }
    )

    const page = await browser.newPage()
    // page.setDefaultTimeout(3000)

    await page.goto('https://github.com/jasonlong')
    await page.setViewport({ width: 1280, height: 1024 })

    // Click the 3D toggle switch
    await page.waitForSelector('[data-ic-option="cubes"]', { visible: true })
    await page.click('[data-ic-option="cubes"]')

    // Contributions section
    const contribTotal = await page.$eval(
      '.ic-contributions-wrapper ::-p-text(Contributions) + div ::-p-text(Total)',
      (el) => el.previousElementSibling.textContent
    )
    validateNumberIsPositive(contribTotal.toString())

    await browser.close()

    return {
      statusCode: 200,
      body: JSON.stringify({ contribTotal })
    }
  })()

  return
}

// export const config = {
//   schedule: '@hourly'
// }
