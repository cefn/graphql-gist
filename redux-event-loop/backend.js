import nodeFetch from "node-fetch"

async function getFromPath(path) {
  const endpoint = `http://localhost:8080${path}`
  const req = {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
  }
  const res = await nodeFetch(endpoint, req)
  return res.json()
}

async function postToPath(path, data) {
  const endpoint = `http://localhost:8080${path}`
  const req = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(data)
  }
  const res = await nodeFetch(endpoint, req)
  return res.json()
}

async function loadSchema(itemType) {
  return await getFromPath(`/schema/${itemType}`)
}

async function listIds(itemType) {
  return await getFromPath(`/listids/${itemType}`)
}

async function loadItem(itemType, itemId) {
  return await getFromPath(`/load/${itemType}/${itemId}`)
}

async function saveItem(itemType, itemData) {
  return await postToPath(`/save/${itemType}`, itemData)
}

export default {
  loadSchema,
  listIds,
  loadItem,
  saveItem
}