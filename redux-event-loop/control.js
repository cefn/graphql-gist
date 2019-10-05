import reduxWatch from "redux-watch"
import { storeValue, storePromisedValue, storeValuesByPath, initialiseStore } from "./store"
import backend from "./backend"

const defaultStore = {
  types: [], //list of types
  schemas: {}, //map schemas by type
  ids: {}, //map id lists by type
  rows: {}, //map rows by id
  focusType: null, //the row type in focus
  focusId: null, //the row id in focus
}

//synchronous state-merging actions
const changeFocusAction = (focusType, focusId) => storeValuesByPath(changeFocusAction, { focusType, focusId }) //navigate to a row

//lazy, asynchronous, backend-service-using actions
const loadTypesAction = () => storePromisedValue(loadTypesAction, "types", backend.loadTypes())
const loadSchemaAction = (rowType) => storePromisedValue(loadSchemaAction, `schemas.${rowType}`, backend.loadSchema(rowType))
const loadIdsAction = (rowType) => storePromisedValue(loadIdsAction, `ids.${rowType}`, backend.loadIds(rowType))
const loadRowAction = (rowType, rowId) => storePromisedValue(loadRowAction, `rows.${rowId}`, backend.loadItem(rowType, rowId))

//saving needs special event treatment
//associates focus with id (if row previously had no id) 
//updates local row (if server adds/modifies values for that row on save, including the id)
const saveRowAction = (rowType, localRow) => async (dispatch, getState) => {
  const { rows, focusType } = getState()
  const remoteRow = await backend.saveItem(rowType, localRow) //write to remote, retrieve server version
  await dispatch(storeValue(saveRowAction, `rows.${remoteRow.id}`, remoteRow)) //overwrite local with server version
  if (remoteRow.id !== localRow.id) {
    await dispatch(changeFocusAction(focusType, remoteRow.id)) //focus on new row id
  }
}

//configure event sequences needed for the app 
//and launch the application with default type of 'note' and id of null
function initialiseActions(store, initialType = "note", initialId = null) {

  const track = (path, fn) => {
    const watch = reduxWatch(store.getState, path)
    store.subscribe(watch(fn))
  }
  const dispatch = store.dispatch

  //lazy-load schema and id list when non-null type comes into focus
  track("focusType", (nextFocusType) => {
    const { schemas, ids } = store.getState()
    if (nextFocusType) {
      if (!schemas[nextFocusType]) {
        dispatch(loadSchemaAction(nextFocusType))
      }
      if (!ids[nextFocusType]) {
        dispatch(loadIdsAction(nextFocusType))
      }
    }
  })

  //load row when non-null id comes into focus  
  track("focusId", (nextFocusId, prevFocusId) => {
    const { focusType, rows } = store.getState()
    if (focusType) {
      if (!prevFocusId) { //focusId was null (new row)
        //refresh ids in case new row was assigned an id 
        dispatch(loadIdsAction(focusType))
      }
      if (nextFocusId) { //newly focused row
        //ensure it's loaded
        if (!rows[nextFocusId]) {
          dispatch(loadRowAction(focusType, nextFocusId))
        }
      }
    }
  })

  //load all types
  dispatch(loadTypesAction())

  //set initial type and id
  dispatch(changeFocusAction(initialType, initialId))
}

function launchStore() {
  const store = initialiseStore(defaultStore)
  initialiseActions(store)
  return store
}

export { //all values and callbacks
  launchStore,
  changeFocusAction,
  saveRowAction,
}