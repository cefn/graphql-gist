const { Builder, By, Key, until } = require("selenium-webdriver")
const chrome = require("selenium-webdriver/chrome")
require("chromedriver")

const frontPage = "http://localhost:8080"
const headless = true

async function createDriver() {
  let chain = new Builder().forBrowser("chrome")
  if (headless) {
    chain = chain.setChromeOptions(new chrome.Options().headless())
  }
  return chain.build()
}

function withDriver(fn) {
  return async () => {
    const driver = await createDriver()
    try {
      await fn(driver)
    }
    finally {
      await driver.quit()
    }
  }
}

function promiseTimeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function promiseFormFields(driver, formCss = "form") {
  const form = await driver.wait(until.elementLocated(By.css(formCss)))
  return await form.findElements(By.css("input"))
}

async function mapFormFields(driver, formCss) {
  const fieldMap = {}
  for (const formField of await promiseFormFields(driver, formCss)) {
    fieldMap[await formField.getAttribute("name")] = formField
  }
  return fieldMap
}


test("Can load page", withDriver(async (driver) => {
  await driver.get(frontPage)
}))

test("Page has form", withDriver(async (driver) => {
  await driver.get(frontPage)
  const form = await driver.wait(until.elementLocated(By.css("form")))
  expect(form).not.toBeNull()
}))

test("Page contains form fields", withDriver(async (driver) => {
  await driver.get(frontPage)
  const formFields = [...(await promiseFormFields(driver))]
  expect(formFields.length > 0)
}))

test("Form fields include those expected", withDriver(async (driver) => {
  await driver.get(frontPage)
  const fieldMap = await mapFormFields(driver)
  expect(fieldMap).toHaveProperty("id")
  expect(fieldMap).toHaveProperty("title")
}))

test("Title edit auto-saves to server and assigns id", withDriver(async (driver) => {
  await driver.get(frontPage)
  const fieldMap = await mapFormFields(driver)
  const idField = fieldMap["id"]
  const titleField = fieldMap["title"]
  let idValue
  idValue = await idField.getAttribute("value")
  expect(idValue.length == 0)
  titleField.sendKeys("c")
  await promiseTimeout(1000)
  idValue = await idField.getAttribute("value")
  expect(idValue.length > 0)
}))

// test("Can load page", withDriver(async (driver) => {
//   await driver.get(frontPage)
// }))

// test("Page has new button", withDriver(async (driver) => {
//   await driver.get(frontPage)
// }))
