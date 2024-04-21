const puppeteer = require('puppeteer-core')
const chromium = require('@sparticuz/chromium')
const dotenv = require('dotenv').config()

const whatSite = 'https://www.newworld.com/en-us/support/server-status'

exports.handler = async (event, context) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
    headless: chromium.true,
    ignoreHTTPSErrors: true
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 1024 })

  const elementFound = async (ele) => {
    try {
      console.log('Element', ele)
      return await page.waitForSelector(ele, { timeout: 5000 })
    } catch (error) {
      console.log(`Element not found`)
      return (ele = null)
    }
  }

  try {
    await page.goto(whatSite)
    // const el = await page.waitForSelector('body > main > section > div > div.ags-ServerStatus-content-tabs > a:nth-child(2) > div')
    await page.click('body > main > section > div > div.ags-ServerStatus-content-tabs > a:nth-child(2) > div')

    // const screenshot = await page.screenshot();

    let serverLocked = await elementFound(
      'body > main > section > div > div.ags-ServerStatus-content-responses > div.ags-ServerStatus-content-responses-response.ags-ServerStatus-content-responses-response--centered.ags-js-serverResponse.is-active > div:nth-child(11) > div.ags-ServerStatus-content-responses-response-server-status-wrapper > div.ags-ServerStatus-content-responses-response-server-status.ags-ServerStatus-content-responses-response-server-status--noTransfer'
    )
    // let serverOnlineCount = await elementFound("#svelte > div.container.mt-4.container-mb.my-auto.svelte-1d6did6 > div.container > div > div.item-table.table\! > div > section > article > table > tbody > tr:nth-child(22) > td:nth-child(6) > span");
    // let serverQueue = await elementFound("#svelte > div.container.mt-4.container-mb.my-auto.svelte-1d6did6 > div.container > div > div.item-table.table\! > div > section > article > table > tbody > tr:nth-child(22) > td:nth-child(7)");

    // tableData = await page.evaluate(() => {
    //   const tds = Array.from(document.querySelectorAll('table tr td'))
    //   return tds.map(td => td.innerText)
    // });

    await browser.close()

    //   let queueUrl = "";
    //   if(screenshot) {

    //     const { data, error } = await supabase
    //     .storage
    //     .from('public')
    //     .upload('current-bene-queue.png', screenshot, {
    //       upsert: true,
    //       contentType: 'image/png'
    //     });

    //     if(error) {
    //       console.log(error);
    //     }

    //     if(data) {
    //       queueUrl = data.Key
    //       console.log(`Bucket url ${queueUrl}`);
    //   }
    // }

    // const { data, error } = await supabase
    // .from("new_world__queue")
    // .update({
    //   updated_at: new Date().toISOString().toLocaleString('en-US'),
    //   queue_count: `${serverQueue ? serverQueue : 0}`,
    //   online_count: `${serverOnlineCount ? serverOnlineCount : 0}`,
    //   server_locked: `${serverLocked ? "Server Locked" : "Server Unlocked"}`
    // })
    // .match({
    //   id: 1
    // })
    console.log(serverLocked)
    if (serverLocked === null) {
      console.log('server is unlocked')
      serverLocked = false
    } else {
      console.log('server is locked')
      serverLocked = true
    }

    console.log('Data added to supabase')
    console.log(serverLocked)
    // console.log(`Current Queue: ${serverQueue}, Online Count: ${serverOnlineCount}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    }
  } catch (error) {
    await browser.close()

    console.log(error)

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed' })
    }
  }
}
