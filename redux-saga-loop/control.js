/* eslint-disable require-atomic-updates */
import { createStore, applyMiddleware } from "redux"
import reduxSaga from "redux-saga"
import { call, put, spawn, take, select } from "redux-saga/effects"
import { storeValueAction, storeByPathAction, createStoreResolvedSaga, defaultReducer } from "./store"
import backend from "./backend"

const defaultState = {
  types: [], //list of types
  schemas: {}, //map schemas by type
  ids: {}, //map id lists by type
  rows: {}, //map rows by id
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
}

function* monitorSelector(selector, valueFilter, takePattern = "*") {
  while (true) {
    const nextValue = yield select(selector)
    if (valueFilter(nextValue)) {
      return nextValue
    }
    yield take(takePattern)
  }
}


//synchronous state-merging actions
function* changeFocusSaga(focusType, focusId) { //navigate to a row
  yield put(storeByPathAction({ focusType, focusId }))
}

//asynchronous, backend-service-using actions
function* loadTypesSaga() { yield* createStoreResolvedSaga("types", backend.loadTypes) }
function* loadSchemaSaga(rowType) { yield* createStoreResolvedSaga(`schemas.${rowType}`, backend.loadSchema, rowType) }
function* loadIdsSaga(rowType) { yield* createStoreResolvedSaga(`ids.${rowType}`, backend.loadIds, rowType) }
function* loadRowSaga(rowType, rowId) { yield* createStoreResolvedSaga(`rows.${rowId}`, backend.loadItem, rowType, rowId) }

//lazy-load schema and id list when non-null type comes into focus
function* focusTypeSaga() {
  let previousFocusType
  while (true) {
    const focusType = yield* monitorSelector(state => state.focusType, focusType => focusType !== previousFocusType)
    if (focusType) {
      //load schema if missing
      const schema = yield select(state => state.schemas[focusType])
      if (!schema) {
        yield spawn(loadSchemaSaga, focusType)
      }
      //load ids if missing
      const ids = yield select(state => state.ids[focusType])
      if (!ids) {
        yield spawn(loadIdsSaga, focusType)
      }
    }
    previousFocusType = focusType
  }
}

//load row when non-null id comes into focus  
function* focusIdSaga() {
  let previousFocusId
  while (true) {
    const focusId = yield* monitorSelector(state => state.focusId, focusId => focusId !== previousFocusId)
    const { focusType, rows } = yield select()
    if (focusType) {
      if (!previousFocusId) { //focusId previously empty or new row (null id)
        //ensure id list is refreshed to include saved row
        yield spawn(loadIdsSaga, focusType)
      }
      if (focusId) { //newly focused row
        if (!rows[focusId]) {
          //ensure it's loaded
          yield spawn(loadRowSaga, focusType, focusId)
        }
      }
    }
    previousFocusId = focusId
  }
}


function* saveRowSaga(rowType, localRow) {
  const remoteRow = yield call(backend.saveItem, rowType, localRow) //write to remote, retrieve server version
  yield put(storeValueAction(`rows.${remoteRow.id}`, remoteRow))
  if (!localRow.id) { //localRow was newly saved
    yield spawn(changeFocusSaga, rowType, remoteRow.id)
  }
}

//configure event sequences needed for the app 
//and launch the application with default type of 'note' and id of null

const reduxSagaMiddleware = reduxSaga()

function saveRow(rowType, localRow) {
  reduxSagaMiddleware.run(saveRowSaga, rowType, localRow)
}

function changeFocus(rowType, rowId) {
  reduxSagaMiddleware.run(changeFocusSaga, rowType, rowId)
}

const store = createStore(
  defaultReducer, //handles storeValue, storeValueMap, storePromisedValue actions
  defaultState,
  applyMiddleware(reduxSagaMiddleware)
)

reduxSagaMiddleware.run(function* () {
  yield spawn(focusTypeSaga)
  yield spawn(focusIdSaga)
  yield spawn(loadTypesSaga)
  yield spawn(changeFocusSaga, "note", null)
})

export { //all values and callbacks
  store,
  changeFocus,
  saveRow,
}