import React from "react"
import PropTypes from "prop-types"

import RowEditor from "./RowEditor"

const TableEditor = (props) => {

  const createFocusChanger = (rowType, rowId) => function focusChanger() {
    return props.changeFocus(rowType, rowId)
  }

  const handleRowChange = (row) => {
    props.saveRow(props.focusType, row)
  }

  return <>
    <input type="button" onClick={createFocusChanger(props.focusType, null)} value="New"></input>
    <ul>
      {props.focusTypeIds.map((id) =>
        <li key={id}>
          <input type="button" onClick={createFocusChanger(props.focusType, id)} value={`Load ${id.substring(0, 8)}`}></input>
        </li>)}
    </ul>
    {props.focusTypeSchema ? <RowEditor schema={props.focusTypeSchema} row={props.focusIdRow} onChange={handleRowChange}></RowEditor> : <h2>Loading Editor...</h2>}
  </>
}
TableEditor.defaultProps = {
  focusType: null,
  focusTypeIds: [],
  focusTypeSchema: null,
  focusId: null,
  focusIdRow: null,
}
TableEditor.propTypes = {
  focusType: PropTypes.string,
  focusTypeIds: PropTypes.array,
  focusTypeSchema: PropTypes.object,
  focusId: PropTypes.string,
  focusIdRow: PropTypes.object,
  changeFocus: PropTypes.func.isRequired,
  saveRow: PropTypes.func.isRequired
}


export default TableEditor