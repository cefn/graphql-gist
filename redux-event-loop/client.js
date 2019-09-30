import React, { Fragment } from "react"
import PropTypes from "prop-types"
import ReactDom from "react-dom"
import backend from "./backend"
import { focusRow } from "./store"
import { Provider, connect } from "react-redux"

import whyDidYouRender from "@welldone-software/why-did-you-render"

whyDidYouRender(React)

const tableStateMap = ({ types, focusType, ids }, /*ownProps*/) => {
  return {
    types,
    focusType,
    focusTypeIds: ids[focusType] || [] //retrieve idlist for current focusType
  }
}

const tableDispatchMap = {
  focusRow
}

const TableEditor = connect(tableStateMap, tableDispatchMap, ({ types, ids, focusType, focusRow }) => {

  const createFocusCallback = (rowType, rowId) => {
    return focusRow.bind(null, rowType, rowId)
  }

  return <Fragment>
    {/* Button to edit blank note (null id) */}
    <div>
      <input type="button" onClick={createFocusCallback(focusType, null)} value="New"></input>
    </div>

    {/* Buttons to edit existing notes (with id) */}
    {ids.map((id) =>
      <div key={id}>
        <input type="button" onClick={createFocusCallback(rowType, id)} value={`Load ${id.substring(0, 8)}`}></input>
      </div>)}

    {/* Edit control */}
    {remoteSchema ? <RowEditor schema={remoteSchema} item={localRow} onChange={rowEditorCallback}></RowEditor> : <h2>Loading Editor...</h2>}
  </Fragment>
}
)

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


ReactDom.render(
  <Provider store={store}>
    <TableEditor />
  </Provider>,
  document.getElementById("app")
)