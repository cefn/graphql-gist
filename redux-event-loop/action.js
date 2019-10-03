import { logger } from "./util"
import { populateMerge } from "./store"
import backend from "./backend"

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


//asynchronous, backend-service-using actions

function loadTypesAction() {
  return async (dispatch) => {
    try { return dispatch(receiveTypesAction(await backend.loadTypes())) }
    catch (error) { logger.log({ error, message: "Loading types failed" }) }
  }
}

function loadSchemaAction(rowType) {
  return async (dispatch) => {
    try { return dispatch(receiveSchemaAction(rowType, await backend.loadSchema(rowType))) }
    catch (error) { logger.log({ error, message: `Loading schema for '${rowType}' failed` }) }
  }
}


const loadIdsAction = (rowType) => {
  return async (dispatch) => {
    try { return dispatch(receiveIdsAction(rowType, await backend.loadIds(rowType))) }
    catch (error) { logger.log({ error, message: `Loading ids for '${rowType}' failed` }) }
  }
}

const loadRowAction = (rowId) => {
  return async (dispatch) => {
    try { return dispatch(receiveRowAction(await backend.loadItem(rowId))) }
    catch (error) { logger.log({ error, message: `Loading row '${rowId}' failed` }) }
  }
}

function saveRowAction(rowType, localRow) {
  return async (dispatch, getState) => {
    const state = getState()
    try {
      const remoteRow = await backend.saveItem(rowType, localRow)
      if (remoteRow.id !== localRow.id) { //focus on newly assigned id
        dispatch(changeFocusAction(state.focusType, remoteRow.id))
      }
      dispatch(receiveRowAction(remoteRow))
    }
    catch (error) { logger.log({ error, message: `Saving row ${localRow} failed` }) }
  }
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
}