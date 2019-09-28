import lodash from "lodash"
import React, { useState, useEffect, useCallback, Fragment } from "react"
import PropTypes from "prop-types"
import ReactDom from "react-dom"
import backend from "./backend"

function TableEditor() {
  //define the focused row type and id
  const [rowType, setRowType] = useState("note")
  const [rowId, setRowId] = useState(null) //start with a blank row

  //track the primary key list, schema, item from db 
  const [remoteIds, setRemoteIds] = useState([])
  const [remoteSchema, setRemoteSchema] = useState(null)
  const [remoteRow, setRemoteRow] = useState(null)

  //track editing changes
  const [localRow, setLocalRow] = useState(null)

  //callbacks to populate up-to-date values from the db
  const fetchSchema = useCallback(async () => setRemoteSchema(await backend.loadSchema(rowType)), [rowType])
  const fetchItem = useCallback(async () => setRemoteRow(await backend.loadItem(rowType, rowId)), [rowId, rowType])
  const fetchIds = useCallback(async () => setRemoteIds(await backend.listIds(rowType)), [rowType])

  //callbacks to manipulate local and remote row information
  const saveItem = useCallback(async () => setRemoteRow(await backend.saveItem(rowType, localRow)), [rowType, localRow])
  const resetItem = useCallback(() => {
    setLocalRow(null)
    setRemoteRow(null)
  }, [])

  //handle changes in focused record id
  //reset for null id, fetch record otherwise
  useEffect(() => {
    if (rowId === null) {
      //blank data
      resetItem()
    }
    else {
      //populate data
      fetchItem()
    }
    fetchIds()
  }, [rowId, rowType, fetchItem, resetItem, fetchIds])

  //handle changes in focused record type
  //fetch schema
  useEffect(() => {
    fetchSchema()
  }, [fetchSchema, rowType])

  //merge changes from remote
  useEffect(() => {
    if (remoteRow) {
      if (lodash.isEqual(localRow, remoteRow)) {
        console.log("Update discarded: Already synced with remote")
      }
      else {
        //reconcile with current focus
        if (rowId) { //focus already set
          if (remoteRow.id !== rowId) { //focus should match
            console.log(`Update discarded: Cannot sync ${remoteRow.id} into ${rowId}`)
            return
          }
        }
        else { //focus not set, update it to track db
          setRowId(remoteRow.id)
        }
        setLocalRow({ ...remoteRow })
      }
    }
    // Do not propagate changes from localRow!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId, remoteRow])

  //merge changes from local
  useEffect(() => {
    if (localRow) {
      if (lodash.isEqual(localRow, remoteRow)) {
        console.log("Update discarded: Already synced with remote")
      }
      else {
        saveItem()
      }
    }
    // Do not propagate changes from remoteRow!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localRow, saveItem])

  //creates 'navigation' callbacks which change the focused row
  const createFocusCallback = useCallback((focusType, focusId) => { //useCallback() not needed here?
    const focusCallback = () => {
      setRowType(focusType)
      setRowId(focusId)
    }
    return focusCallback
  }, [])

  //handle changes in row editor
  const rowEditorCallback = useCallback((changedItem) => {
    setLocalRow(changedItem)
  }, [])

  return <Fragment>
    {/* Button to edit blank note (null id) */}
    <div>
      <input type="button" onClick={createFocusCallback(rowType, null)} value="New"></input>
    </div>

    {/* Buttons to edit existing notes (with id) */}
    {remoteIds.map((remoteId) =>
      <div key={remoteId}>
        <input type="button" onClick={createFocusCallback(rowType, remoteId)} value={`Load ${remoteId.substring(0, 8)}`}></input>
      </div>)}

    {/* Edit control */}
    {remoteSchema ? <RowEditor schema={remoteSchema} item={localRow} onChange={rowEditorCallback}></RowEditor> : <h2>Loading Editor...</h2>}
  </Fragment>
}

function RowEditor(props) {
  //creates separate handler for each field to handle value changes  
  const createFieldHandler = useCallback((fieldName) => {
    const fieldHandler = (event) => {
      props.onChange({ ...props.item, [fieldName]: event.target.value })
    }
    return fieldHandler
  }, [props])

  return <form>
    {Object.entries(props.schema).map(([fieldName]) => {
      return <div key={fieldName}>
        <label style={{ display: "inline-block", width: "100px" }}>{fieldName}</label>
        <input name={fieldName} value={(props.item && props.item[fieldName]) || ""} onChange={createFieldHandler(fieldName)} />
      </div>
    })}
  </form >
}

RowEditor.propTypes = {
  "schema": PropTypes.object.isRequired,
  "onChange": PropTypes.func.isRequired,
  "item": PropTypes.object,
}

ReactDom.render(<TableEditor />, document.getElementById("app"))