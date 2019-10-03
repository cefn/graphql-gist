import { createStore, applyMiddleware } from "redux"
import reduxThunk from "redux-thunk"
import deepMerge from "deepmerge"
import { containsTree } from "./util"

const defaultState = {
  types: [], //list of types
  schemas: {}, //map schemas by type
  ids: {}, //map id lists by type
  rows: {}, //map rows by id
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
}

const populateAction = (fn, payload) => ({ type: fn.name, payload })
const populateMerge = (fn, mergeState) => populateAction(fn, { mergeState })
const populateMergeCheck = (fn, mergeState, checkState) => populateAction(fn, { mergeState, checkState })

const replaceArray = (_destinationArray, sourceArray, _options) => sourceArray
const mergeObject = (a, b) => deepMerge(a, b, { arrayMerge: replaceArray })

const defaultReducer = (state = defaultState, action) => {
  const { type, payload } = action
  //try to perform merges optionally with tree check
  if (payload) {
    const { mergeState, checkState } = payload
    if (mergeState) {
      if ((!checkState) || containsTree(state, checkState)) {
        state = mergeObject(state, mergeState)
      }
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
  populateMerge,
}