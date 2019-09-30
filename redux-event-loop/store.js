import { createStore, combineReducers } from "redux"
import { } from "redux-saga"
import deepMerge from "deepmerge"

const defaultState = {
  types: [], //list of types
  schemas: {}, //map schemas by type
  ids: {}, //map id lists by type
  rows: {}, //map rows by id
  focusId: null, //the row id in focus
  focusType: null, //the row type in focus
  focusRow: null, //the edit state of row in focus
}

function populateAction(fn, payload) {
  return {
    type: fn.name,
    payload
  }
}

function populateMerge(fn, payload) {
  return {
    ...populateAction(fn, payload),
    stateMerge: true
  }
}

//change the focus row of the app
const changeFocus = (focusType, focusId) => populateMerge(changeFocus, { focusType, focusId })
//receive the list of possible types from the server 
const receiveTypes = (types) => populateMerge(receiveTypes, { types })
//receive schema for a type from the server
const receiveSchema = (type, schema) => populateMerge(receiveSchema, { schemas: { [type]: schema } })
//receive list of ids for a type from the server
const receiveIds = (type, ids) => populateMerge(receiveIds, { ids: { [type]: ids } })
//receive a row from the server
const receiveRow = (row) => populateMerge(receiveRow, { rows: { [row.id]: row } })
//handle an update from the editor
const handleRowEdited = (focusRow) => populateMerge(handleRowEdited, { focusRow })

const replaceArray = (_destinationArray, sourceArray, _options) => sourceArray
const mergeObject = (a, b) => deepMerge(a, b, { arrayMerge: replaceArray })

const mergeReducer = (state = defaultState, action) => {
  if (action.stateMerge) {
    return mergeObject(state, action.payload)
  }
  else {
    return state
  }
}


const defaultReducer = combineReducers({
  mergeReducer: mergeReducer
})

const store = createStore(defaultReducer)

export {
  store,
  changeFocus,
  receiveTypes,
  receiveSchema,
  receiveIds,
  receiveRow,
  handleRowEdited,
}