import React from "react"
import { connect } from "react-redux"
import RowEditor from "./RowEditor"
import { changeFocusAction, saveRowAction } from "../control"

/* CONFIGURE REDUX CONNECTOR */

//map redux store to react props 
const stateToProps = ({ focusType, focusId, schemas, rows, ids } /*, ownProps*/) => ({
  focusType,
  focusTypeIds: ids[focusType] || [],
  focusTypeSchema: schemas[focusType],
  focusId,
  focusIdRow: rows[focusId],
})

//map callback actions to react props 
const dispatchToProps = {
  changeFocusAction,
  saveRowAction
}

//wire state and actions to props
const reduxConnector = connect(stateToProps, dispatchToProps)

/* CREATE TABLE EDITOR */

const TableEditor = reduxConnector((props) => {

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


export default TableEditor