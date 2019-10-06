const { Builder, By, Key, until } = require("selenium-webdriver")
const chrome = require("selenium-webdriver/chrome")
const nodeFetch = require("node-fetch")
require("chromedriver")

const frontPage = "http://localhost:8080"
const headless = true
const editTimeout = 200

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

async function promiseFields(driver, formCss = "form", fieldCss = "input") {
  const form = await driver.wait(until.elementLocated(By.css(formCss)))
  return form.findElements(By.css(fieldCss))
}

async function promiseMapFields(driver, formCss) {
  const fieldMap = {}
  const fieldList = await promiseFields(driver, formCss)
  for (const field of fieldList) {
    const fieldName = await field.getAttribute("name")
    fieldMap[fieldName] = field
  }
  return fieldMap
}

async function promiseButtons(driver, buttonCss = "input[type=button]") {
  await driver.wait(until.elementLocated(By.css(buttonCss)))
  return driver.findElements(By.css(buttonCss))
}

async function promiseMapButtons(driver, buttonCss) {
  const buttonMap = {}
  for (const button of await promiseButtons(driver, buttonCss)) {
    const buttonName = await button.getAttribute("value")
    buttonMap[buttonName] = button
  }
  return buttonMap
}

async function getRemoteRowIds(rowType) {
  const response = await nodeFetch(`${frontPage}/listids/note`)
  return await response.json()
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
  const formFields = [...(await promiseFields(driver))]
  expect(formFields.length > 0)
}))

test("Form fields include those expected", withDriver(async (driver) => {
  await driver.get(frontPage)
  const fieldMap = await promiseMapFields(driver)
  expect(fieldMap).toHaveProperty("id")
  expect(fieldMap).toHaveProperty("title")
}))

test("Editing title field auto-saves to server", withDriver(async (driver) => {
  await driver.get(frontPage)
  const fieldMap = await promiseMapFields(driver)
  const titleField = fieldMap["title"]
  const remoteRowCountBefore = (await getRemoteRowIds("note")).length
  titleField.sendKeys("c")
  await promiseTimeout(editTimeout)
  const remoteRowCountAfter = (await getRemoteRowIds("note")).length
  expect(remoteRowCountAfter - remoteRowCountBefore).toBe(1)
}))


test("Editing title field assigns to previously empty id field", withDriver(async (driver) => {
  await driver.get(frontPage)
  const fieldMap = await promiseMapFields(driver)
  const idField = fieldMap["id"]
  const titleField = fieldMap["title"]
  const idValueBefore = await idField.getAttribute("value")
  expect(idValueBefore.length == 0)
  titleField.sendKeys("c")
  await promiseTimeout(editTimeout)
  const idValueAfter = await idField.getAttribute("value")
  expect(idValueAfter.length > 0)
}))

test("Clicking on the New button creates an empty row", withDriver(async (driver) => {
  await driver.get(frontPage)
  let fieldMap
  //dirty the form
  fieldMap = await promiseMapFields(driver)
  fieldMap["title"].sendKeys("z")
  await promiseTimeout(editTimeout)

  //press a button to create a new record
  const buttonMap = await promiseMapButtons(driver)
  const newButton = buttonMap["New"]
  await newButton.click()
  await promiseTimeout(editTimeout)

  fieldMap = promiseMapFields(driver)
  for (const [fieldName, fieldValue] of Object.entries(fieldMap)) {
    expect(fieldValue).toBe("")
  }
}))

// test("Page has new button", withDriver(async (driver) => {
//   await driver.get(frontPage)
// }))
