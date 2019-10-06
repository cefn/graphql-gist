import isString from "lodash/isString"
import isPlainObject from "lodash/isPlainObject"
import set from "lodash/set"
import { call, put } from "redux-saga/effects"

const STORE_VALUE = "store-value"
const STORE_BY_PATH = "store-by-path"

function storeValueAction(path, value) {
  return {
    type: STORE_VALUE,
    payload: {
      path,
      value
    }
  }
}

function storeByPathAction(valuesByPath) {
  return {
    type: STORE_BY_PATH,
    payload: {
      valuesByPath
    }
  }
}

function* createStoreResolvedSaga(path, promiseFactory, ...promiseFactoryArgs) {
  const result = yield call(promiseFactory, ...promiseFactoryArgs)
  yield put(storeValueAction(path, result))
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


export {
  storeValueAction,
  storeByPathAction,
  createStoreResolvedSaga,
  defaultReducer
}
