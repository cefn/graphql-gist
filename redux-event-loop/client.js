import React from "react"
import PropTypes from "prop-types"
import ReactDom from "react-dom"
import { store } from "./store"
import { Provider, connect } from "react-redux"
import whyDidYouRender from "@welldone-software/why-did-you-render"

/* CONFIGURE REDUX CONNECTOR */

//a map of redux actions to be be dispatch-wrapped, assigned to props 
import action from "./action"

//a map of redux store to editor props 
const tableEditorStateMap = ({ focusType, focusId, schemas, rows, ids } /*, ownProps*/) => ({
  focusType,
  focusTypeIds: ids[focusType] || [],
  focusTypeSchema: schemas[focusType],
  focusId,
  focusIdRow: rows[focusId],
})

const tableEditorDispatchMap = action
const { launchApplication } = action

//connector which wires state and functions to props
const tableEditorReduxConnector = connect(tableEditorStateMap, tableEditorDispatchMap)

//trigger data loading
launchApplication(store)

//monitor wasted renders
whyDidYouRender(React)


const TableEditor = tableEditorReduxConnector((props) => {

  const createFocusChanger = (rowType, rowId) => function focusChanger() {
    return props.changeFocusAction(rowType, rowId)
  }

  const rowChangeHandler = (row) => {
    props.saveRowAction(props.focusType, row)
  }

  return <>
    <input type="button" onClick={createFocusChanger(props.focusType, null)} value="New"></input>
    <ul>
      {props.focusTypeIds.map((id) =>
        <li key={id}>
          <input type="button" onClick={createFocusChanger(props.focusType, id)} value={`Load ${id.substring(0, 8)}`}></input>
        </li>)}
    </ul>
    {props.focusTypeSchema ? <RowEditor schema={props.focusTypeSchema} row={props.focusIdRow} onChange={rowChangeHandler}></RowEditor> : <h2>Loading Editor...</h2>}
  </>
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