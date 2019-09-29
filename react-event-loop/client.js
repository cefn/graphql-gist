import lodash from "lodash"
import React, { useState, useEffect, useCallback, Fragment } from "react"
import PropTypes from "prop-types"
import ReactDom from "react-dom"
import backend from "./backend"

import whyDidYouRender from "@welldone-software/why-did-you-render"

whyDidYouRender(React)

function TableEditor() {
  //define the focused row type and id
  const [rowType, setRowType] = useState("note") //server-side map has a 'note' schema with id,title
  const [rowId, setRowId] = useState(null) //start with a blank row

  //track the primary key list, schema, row from db 
  const [remoteIds, setRemoteIds] = useState([]) //list of row ids
  const [remoteSchema, setRemoteSchema] = useState(null) //field types,names for each row of this type
  const [remoteRow, setRemoteRow] = useState(null)

  //track changes to the row from pure child RowEditor component
  const [localRow, setLocalRow] = useState(null)

  //fetch list of row ids
  const fetchIds = useCallback(async () => setRemoteIds(await backend.listIds(rowType)), [rowType])

  //get row id list on load
  useEffect(() => {
    fetchIds()
  }, [fetchIds])

  //changing focused record type,id requires row fetch
  useEffect(() => {
    if (rowId === null) { //focused id is null - no remote copy (blank row not saved to db, yet)
      //blank data
      setLocalRow(null)
      setRemoteRow(null)
    }
    else { //has focused id, there must be a remote copy
      if (localRow && (localRow.id === rowId)) { //localRow already reflects remote copy
        return
      }
      else { //remoteData not yet fetched
        setRemoteRow(null)
        const fetchItem = async () => setRemoteRow(await backend.loadItem(rowType, rowId))
        fetchItem()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowType, rowId])

  //changing focused record type requires schema fetch
  useEffect(() => {
    setRemoteSchema(null)
    const fetchSchema = async () => setRemoteSchema(await backend.loadSchema(rowType))
    fetchSchema()
  }, [rowType])

  //updated remoteRow should be merged to local
  useEffect(() => {
    if (remoteRow) {
      if (lodash.isEqual(localRow, remoteRow)) {
        console.log("Save was successful: local now equals remote")
        return
      }
      else {
        //reconcile with focused row
        if (rowId) { //setRowId had triggered remoteRow retrieval
          if (remoteRow.id !== rowId) { //rowId no longer the same
            console.log(`Update discarded: Cannot sync ${remoteRow.id} into ${rowId}`)
            return
          }
        }
        else { //focus wasn't set, blank record id should track db
          setRowId(remoteRow.id)
          fetchIds() //requires rowType dependency
        }
        setLocalRow({ ...remoteRow }) //shallow copy remoteRow
      }
    }
    // Do not propagate changes from localRow!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchIds, remoteRow, rowId, rowType])

  //merge changes from local
  useEffect(() => {
    if (localRow) {
      if (lodash.isEqual(localRow, remoteRow)) {
        console.log("Update discarded: Already synced with remote")
      }
      else {
        const saveItem = async () => setRemoteRow(await backend.saveItem(rowType, localRow))
        saveItem()
      }
    }
    // Do not propagate changes from remoteRow!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localRow])

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

TableEditor.whyDidYouRender = true

// eslint-disable-next-line react/display-name
const RowEditor = React.memo(
  function RowEditor(props) {

    //creates separate handler for each field to handle value changes
    const createFieldHandler = (fieldName) => {
      const fieldHandler = (event) => {
        props.onChange({ ...props.item, [fieldName]: event.target.value })
      }
      return fieldHandler
    }

    return <form>
      {Object.entries(props.schema).map(([fieldName]) => {
        return <div key={fieldName}>
          <label style={{ display: "inline-block", width: "100px" }}>{fieldName}</label>
          <input name={fieldName} value={(props.item && props.item[fieldName]) || ""} onChange={createFieldHandler(fieldName)} />
        </div>
      })}
    </form >
  }

)


RowEditor.propTypes = {
  "schema": PropTypes.object.isRequired,
  "onChange": PropTypes.func.isRequired,
  "item": PropTypes.object,
}

RowEditor.whyDidYouRender = true

ReactDom.render(<TableEditor />, document.getElementById("app"))