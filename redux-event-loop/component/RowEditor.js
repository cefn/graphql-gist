import React from "react"
import PropTypes from "prop-types"

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

export default RowEditor