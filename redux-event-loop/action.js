import reduxWatch from "redux-watch"
import { storeValue, storePromisedValue, storeValuesByPath } from "./store"
import backend from "./backend"

//synchronous state-merging actions
const changeFocusAction = (focusType, focusId) => storeValuesByPath(changeFocusAction, { focusType, focusId }) //navigate to a row

//lazy, asynchronous, backend-service-using actions
const loadTypesAction = () => storePromisedValue(loadTypesAction, "types", backend.loadTypes())
const loadSchemaAction = (rowType) => storePromisedValue(loadSchemaAction, `schemas.${rowType}`, backend.loadSchema(rowType))
const loadIdsAction = (rowType) => storePromisedValue(loadIdsAction, `ids.${rowType}`, backend.loadIds(rowType))
const loadRowAction = (rowType, rowId) => storePromisedValue(loadRowAction, `rows.${rowId}`, backend.loadItem(rowType, rowId))

//save action combines update to focus (if an id is assigned) and update to row (if server adds/modifies values)
const saveRowAction = (rowType, localRow) => async (dispatch, getState) => {
  const { rows, focusType } = getState()
  const remoteRow = await backend.saveItem(rowType, localRow)
  await dispatch(storeValue(saveRowAction, `rows.${remoteRow.id}`, remoteRow))
  if (remoteRow.id !== localRow.id) { //focus on row with newly assigned id
    await dispatch(changeFocusAction(focusType, remoteRow.id))
  }
}

//configure event sequences needed for the app 
//launch the application with default type of 'note' and id of null
function launchApplication(store, initialType = "note", initialId = null) {

  const dispatch = store.dispatch
  const track = (path, fn) => {
    const watch = reduxWatch(store.getState, path)
    store.subscribe(watch(fn))
  }

  //load schema and id list when type comes into focus
  track("focusType", (nextFocusType) => {
    if (nextFocusType) {
      dispatch(loadSchemaAction(nextFocusType))
      dispatch(loadIdsAction(nextFocusType))
    }
  })

  //load row when id comes into focus  
  track("focusId", (nextFocusId) => {
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

  //trigger application load, specifying type and id
  dispatch(changeFocusAction(initialType, initialId))
}

export default {
  loadTypesAction,
  loadSchemaAction,
  loadIdsAction,
  loadRowAction,
  changeFocusAction,
  saveRowAction,
  launchApplication,
}