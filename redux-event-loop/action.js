import reduxWatch from "redux-watch"
import { storeValue, storePromisedValue, storeValuesByPath } from "./store"
import backend from "./backend"

//synchronous state-merging actions

//TODO change to function signature for intellisense auto-complete

//receive the list of possible types from the server 
const receiveTypesAction = (types) => storeValue(receiveTypesAction, "types", types)
//receive schema for a type from the server
const receiveSchemaAction = (type, schema) => storeValue(receiveSchemaAction, `schemas.${type}`, schema)
//receive list of ids for a type from the server
const receiveIdsAction = (type, ids) => storeValue(receiveIdsAction, `ids.${type}`, ids)
//receive an update to a row from the editor or server
const receiveRowAction = (row) => storeValue(receiveRowAction, `rows.${row.id}`, row)
//change the focus row of the app
const changeFocusAction = (focusType, focusId) => storeValuesByPath(changeFocusAction, { focusType, focusId })

//lazy, asynchronous, backend-service-using actions

const loadTypesAction = () => storePromisedValue(loadTypesAction, "types", backend.loadTypes())
const loadSchemaAction = (rowType) => storePromisedValue(loadSchemaAction, `schemas.${rowType}`, backend.loadSchema(rowType))
const loadIdsAction = (rowType) => storePromisedValue(loadIdsAction, `ids.${rowType}`, backend.loadIds(rowType))
const loadRowAction = (rowType, rowId) => storePromisedValue(loadRowAction, `rows.${rowId}`, backend.loadItem(rowType, rowId))

const saveRowAction = (rowType, localRow) => async (dispatch, getState) => {
  const { rows, focusType } = getState()
  const remoteRow = await backend.saveItem(rowType, localRow)
  if (remoteRow.id !== localRow.id) { //focus on newly assigned id
    dispatch(changeFocusAction(focusType, remoteRow.id))
  }
  dispatch(storeValue(saveRowAction, `rows.${remoteRow.id}`, remoteRow))
}

function track(store, path, fn) {
  const watch = reduxWatch(store.getState, path)
  store.subscribe(watch(fn))
}

//configure event sequences needed for the app 
//launch the application with default type of 'note' and id of null
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
    const { focusType, rows } = store.getState()
    if (focusType) {
      //update nav list to include unfocused row
      const forceLoadIds = true
      dispatch(loadIdsAction(focusType, forceLoadIds))
      //load newly focused row
      if (nextFocusId) {
        if (!rows[nextFocusId]) {
          dispatch(loadRowAction(focusType, nextFocusId))
        }
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