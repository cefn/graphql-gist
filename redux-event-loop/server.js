const lodash = require("lodash")
const express = require("express")

//mixin adds upsert, getById etc. to lodash 
const lodashId = require("lodash-id")
lodash.mixin(lodashId)

const port = 8080

const schemas = {
  "note": {
    id: "number",
    title: "string"
  }
}

let items = {
  note: []
}

const app = express()

app.use(express.json())

//serve frontpage which loads webpacked react bundle
app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/static/index.html")
})

//serve webpacked react bundle
app.get("/bundle.js", (req, res, next) => {
  res.sendFile(__dirname + "/static/bundle.js")
})

//serve item schema with field names,types
app.get("/schema/:itemType", (req, res, next) => {
  const itemType = req.params.itemType
  res.json(schemas[itemType])
})

//save item in 'database' 
app.post("/save/:itemType", (req, res, next) => {
  //store in array for this type, send back (possibly modified) item
  const itemType = req.params.itemType
  //  const remoteItem = JSON.parse(req.body)
  const remoteItem = req.body
  const localItem = lodash.upsert(items[itemType], remoteItem)
  res.json(localItem)
  //show database after every edit
  console.log(JSON.stringify(items))
})

//load item by type and id from database 
app.get("/load/:itemType/:itemId", (req, res, next) => {
  const itemType = req.params.itemType
  const itemId = req.params.itemId
  const itemList = items[itemType]
  const item = lodash.getById(itemList, itemId)
  res.json(item)
})

//list types from database 
app.get("/listtypes", (req, res, next) => {
  res.json(Object.keys(schemas))
})


//list item ids by type from database 
app.get("/listids/:itemType", (req, res, next) => {
  const itemType = req.params.itemType
  const itemList = items[itemType] || []
  const itemIdList = lodash.map(itemList, "id")
  res.json(itemIdList)
})

console.log(`Server listening on ${port}`)
app.listen(port)