import puppeteer from 'puppeteer'
import path from 'path'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: 'https://4d4774df4619bd9abb649cffa13fc2c7@o4507041485946880.ingest.us.sentry.io/4507041490272256',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  profilesSampleRate: 1.0
})
;(async () => {
  const pathToExtension = path.join(process.cwd(), 'extension')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`]
  })

  const page = await browser.newPage()

  await page.goto('https://github.com/jasonlong')

  await page.setViewport({ width: 1080, height: 1024 })

  const textSelector = await page.waitForSelector('.js-yearly-contributions h2')
  const fullTitle = await textSelector?.evaluate((el) => el.textContent)

  const threeDButtonSelector = '[data-ic-option="cubes"]'
  await page.click(threeDButtonSelector)

  const contributionsHeaderSelector = await page.waitForSelector('.ic-contributions-wrapper h5')
  const contributionsHeaderTitle = await contributionsHeaderSelector?.evaluate((el) => el.textContent)

  // Print the full title
  console.log('The contribution heading is "%s".', contributionsHeaderTitle)

  await browser.close()
})()
