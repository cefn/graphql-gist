import { createStore, applyMiddleware } from "redux"
import reduxThunk from "redux-thunk"
import isString from "lodash/isString"
import isPlainObject from "lodash/isPlainObject"
import set from "lodash/set"

const defaultState = {
  types: [], //list of types
  schemas: {}, //map schemas by type
  ids: {}, //map id lists by type
  rows: {}, //map rows by id
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
}

function storeValue(type, path, value) {
  if (typeof type === "function") {
    return storeValue(type.name, path, value)
  }
  return {
    type,
    payload: {
      path,
      value
    }
  }
}


function storeValuesByPath(type, valuesByPath) {
  if (typeof type === "function") {
    return storeValuesByPath(type.name, valuesByPath)
  }
  return {
    type,
    payload: {
      valuesByPath
    }
  }
}

function storePromisedValue(type, path, valuePromise) {
  return async (dispatch) => {
    const value = await valuePromise
    dispatch(storeValue(type, path, value))
  }
}

const defaultReducer = (state = defaultState, action) => {
  //seeks values and paths in the payload which define merges
  const { type, payload } = action
  if (payload) {
    state = { ...state } //shallow copy previous state
    if (isString(payload.path)) {
      const { path, value } = payload
      set(state, path, value)
    }
    else if (isPlainObject(payload.valuesByPath)) {
      for (const [path, value] of Object.entries(payload.valuesByPath)) {
        set(state, path, value)
      }
    }
    else {
      throw `Couldn't reduce action:\n${JSON.stringify(action, null, "\t")}`
    }
  }
  return state
}

const store = createStore(
  defaultReducer,
  defaultState,
  applyMiddleware(reduxThunk)
)

export {
  store,
  storeValue,
  storeValuesByPath,
  storePromisedValue,
}