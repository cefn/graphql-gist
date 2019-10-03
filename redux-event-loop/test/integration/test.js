const { Builder, By, Key, until } = require("selenium-webdriver")
require("selenium-webdriver/chrome")
require("chromedriver")

const frontPage = "http://localhost:8080"

function withDriver(fn) {
  return async () => {
    const driver = await new Builder().forBrowser("chrome").build()
    try {
      await fn(driver)
    }
    finally {
      await driver.quit()
    }
  }
}

async function promiseFormFields(driver, formCss = "form") {
  const form = await driver.wait(until.elementLocated(By.css("form")))
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


// test("Can load page", withDriver(async (driver) => {
//   await driver.get(frontPage)
// }))

// test("Page has new button", withDriver(async (driver) => {
//   await driver.get(frontPage)
// }))
