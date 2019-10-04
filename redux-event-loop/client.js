import React, { useEffect, useCallback, Fragment } from "react"
import PropTypes from "prop-types"
import ReactDom from "react-dom"
import { store } from "./store"
import { Provider, connect } from "react-redux"
import allActions from "./action"

import whyDidYouRender from "@welldone-software/why-did-you-render"
whyDidYouRender(React)

const tableStateMap = (state /*, ownProps*/) => {
  const { focusType, focusId, schemas, rows, ids } = state
  return {
    focusType,
    focusTypeIds: ids[focusType] || [],
    focusTypeSchema: schemas[focusType],
    focusId,
    focusIdRow: rows[focusId],
    schemas,
    rows,
    ids,
  }
}

const tableDispatchMap = allActions

const tableConnector = connect(tableStateMap, tableDispatchMap)

const TableEditor = tableConnector((props) => {

  const {
    focusType,
    focusTypeIds,
    focusTypeSchema,
    focusId,
    focusIdRow,
    loadSchemaAction,
    loadIdsAction,
    loadRowAction,
    changeFocusAction,
    saveRowAction,
  } = props

  useEffect(() => { //lazy load schema when record type changes
    if (focusType) {
      loadSchemaAction(focusType)
      loadIdsAction(focusType)
    }
  }, [focusType, loadIdsAction, loadSchemaAction])

  useEffect(() => { //lazy load schema when record type changes
    if (focusId) {
      if ((!focusIdRow) || (!(focusIdRow.id === focusId))) {
        loadRowAction(focusType, focusId)
      }
    }
  }, [focusId, focusIdRow, focusType, loadIdsAction, loadRowAction, loadSchemaAction])

  useEffect(() => { //on launch, load blank record of type note 
    changeFocusAction("note", null)
  }, [changeFocusAction])


  const createFocusChanger = (rowType, rowId) => function focusChanger() {
    return changeFocusAction(rowType, rowId)
  }

  const rowChangeHandler = (row) => {
    saveRowAction(focusType, row)
  }

  return <Fragment>
    <input type="button" onClick={createFocusChanger(focusType, null)} value="New"></input>
    <ul>
      {focusTypeIds.map((id) =>
        <li key={id}>
          <input type="button" onClick={createFocusChanger(focusType, id)} value={`Load ${id.substring(0, 8)}`}></input>
        </li>)}
    </ul>
    {focusTypeSchema ? <RowEditor schema={focusTypeSchema} row={focusIdRow} onChange={rowChangeHandler}></RowEditor> : <h2>Loading Editor...</h2>}
  </Fragment>
})

TableEditor.whyDidYouRender = true

// eslint-disable-next-line react/display-name
const RowEditor = React.memo(
  function RowEditor(props) {

    //creates separate handler for each field to handle value changes
    const createFieldHandler = (fieldName) => {
      const fieldHandler = (event) => {
        const fieldValue = event.target.value
        props.onChange({ ...props.row, [fieldName]: fieldValue })
      }
      return fieldHandler
    }

    return <form id="rowEditor">
      {Object.entries(props.schema).map(([fieldName]) => {
        return <div key={fieldName}>
          <label style={{ display: "inline-block", width: "100px" }}>{fieldName}</label>
          <input name={fieldName} value={(props.row && props.row[fieldName]) || ""} onChange={createFieldHandler(fieldName)} />
        </div>
      })}
    </form >
  }
)
RowEditor.defaultProps = {
  "schema": null,
  "row": null,
}
RowEditor.propTypes = {
  "schema": PropTypes.object,
  "row": PropTypes.object,
  "onChange": PropTypes.func.isRequired,
}
RowEditor.whyDidYouRender = true


ReactDom.render(
  <Provider store={store}>
    <TableEditor />
  </Provider>,
  document.getElementById("app")
)