import { createStore, applyMiddleware } from "redux"
import reduxThunk from "redux-thunk"
import isString from "lodash/isString"
import isPlainObject from "lodash/isPlainObject"
import set from "lodash/set"

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
    return dispatch(storeValue(type, path, value))
  }
}

const defaultReducer = (state = [], action) => {
  //seeks values and paths in the payload which define merges
  const { type, payload } = action
  if (payload) {
    state = { ...state } //shallow copy previous state
    if (isString(payload.path)) { //single path,value pair
      const { path, value } = payload
      set(state, path, value)
    }
    else if (isPlainObject(payload.valuesByPath)) { //map of paths to values
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

function initialiseStore(defaultState) {
  return createStore(
    defaultReducer, //handles storeValue, storeValueMap, storePromisedValue actions
    defaultState,
    applyMiddleware(reduxThunk) //support promise factories (dispatch, getState) => result
  )
}

export {
  storeValue,
  storeValuesByPath,
  storePromisedValue,
  initialiseStore
}