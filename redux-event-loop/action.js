import reduxWatch from "redux-watch"
import { logger } from "./util"
import { populateMerge } from "./store"
import backend from "./backend"
import isEqual from "is-equal"

//synchronous state-merging actions

//TODO change to function signature for intellisense auto-complete
//receive the list of possible types from the server 
const receiveTypesAction = (types) => populateMerge(receiveTypesAction, { types })

//receive schema for a type from the server
const receiveSchemaAction = (type, schema) => populateMerge(receiveSchemaAction, { schemas: { [type]: schema } })

//receive list of ids for a type from the server
const receiveIdsAction = (type, ids) => populateMerge(receiveIdsAction, { ids: { [type]: ids } })

//receive an update to a row from the editor or server
const receiveRowAction = (row) => populateMerge(receiveRowAction, { rows: { [row.id]: row } })

//change the focus row of the app
const changeFocusAction = (focusType, focusId) => populateMerge(changeFocusAction, { focusType, focusId })


//lazy, asynchronous, backend-service-using actions

function loadTypesAction(force = false) {
  return async (dispatch, getState) => {
    const state = getState()
    if (force || !state.types) {
      try { return dispatch(receiveTypesAction(await backend.loadTypes())) }
      catch (error) { logger.log({ error, message: "Loading types failed" }) }
    }
    else {
      logger.log("loadTypesAction skipped - already satisfied")
    }
  }
}

function loadSchemaAction(rowType, force = false) {
  return async (dispatch, getState) => {
    const state = getState()
    if (force || !(state.schemas[rowType])) {
      try { return dispatch(receiveSchemaAction(rowType, await backend.loadSchema(rowType))) }
      catch (error) { logger.log({ error, message: `Loading schema for '${rowType}' failed` }) }
    }
    else {
      logger.log("loadSchemaAction skipped - already satisfied")
    }
  }
}


const loadIdsAction = (rowType, force = false) => {
  return async (dispatch, getState) => {
    const state = getState()
    if (force || !(state.ids[rowType])) {
      try { return dispatch(receiveIdsAction(rowType, await backend.loadIds(rowType))) }
      catch (error) { logger.log({ error, message: `Loading ids for '${rowType}' failed` }) }
    }
    else {
      logger.log("loadIdsAction skipped - already satisfied")
    }
  }
}

const loadRowAction = (rowType, rowId, force = false) => {
  return async (dispatch, getState) => {
    const state = getState()
    if (force || !(state.rows[rowId])) {
      try { return dispatch(receiveRowAction(await backend.loadItem(rowType, rowId))) }
      catch (error) { logger.log({ error, message: `Loading row type:'${rowType}'  id:'${rowId}' failed` }) }
    }
    else {
      logger.log("loadRowAction skipped - already satisfied")
    }
  }
}

function saveRowAction(rowType, localRow, force = false) {
  return async (dispatch, getState) => {
    const state = getState()
    if (force || (!(isEqual(state.rows[localRow.id], localRow)))) {
      try {
        const remoteRow = await backend.saveItem(rowType, localRow)
        if (remoteRow.id !== localRow.id) { //focus on newly assigned id
          dispatch(changeFocusAction(state.focusType, remoteRow.id))
        }
        dispatch(receiveRowAction(remoteRow))
      }
      catch (error) { logger.log({ error, message: `Saving row ${localRow} failed` }) }
    }
    else {
      logger.log("saveRowAction skipped - already satisfied")
    }
  }
}

function track(store, path, fn) {
  const watch = reduxWatch(store.getState, path)
  store.subscribe(watch(fn))
}

//launch the application with default type of 'note' and id of null
//configure event sequences needed for the app 
function launchApplication(store, initialType = "note", initialId = null) {
  const dispatch = store.dispatch

  //load schema and id list when type comes into focus
  track(store, "focusType", (nextFocusType, _prev, _path) => {
    if (nextFocusType) {
      dispatch(loadSchemaAction(nextFocusType))
      dispatch(loadIdsAction(nextFocusType))
    }
  })

  //load row when id comes into focus  
  track(store, "focusId", (nextFocusId, _prev, _path) => {
    const state = store.getState()
    const focusType = state.focusType
    if (focusType && nextFocusId) {
      if (!state.rows[nextFocusId]) {
        dispatch(loadRowAction(focusType, nextFocusId))
      }
    }
  })

  //trigger application load by specifying type and id
  dispatch(changeFocusAction(initialType, initialId))
}

export default {
  loadTypesAction,
  loadSchemaAction,
  loadIdsAction,
  loadRowAction,
  receiveTypesAction,
  receiveSchemaAction,
  receiveIdsAction,
  receiveRowAction,
  changeFocusAction,
  saveRowAction,
  launchApplication,
}