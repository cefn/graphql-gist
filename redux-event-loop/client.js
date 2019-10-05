import React from "react"
import ReactDom from "react-dom"
import { Provider } from "react-redux"
import whyDidYouRender from "@welldone-software/why-did-you-render"

import { launchStore } from "./control"
import TableEditor from "./component/TableEditor"
import RowEditor from "./component/RowEditor"

//launch the application store and logic
const store = launchStore()

import { connect } from "react-redux"

import { changeFocusAction, saveRowAction } from "./control"

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
const connectToRedux = connect(stateToProps, dispatchToProps)

//create editor component with Redux binding
const ReduxTableEditor = connectToRedux(TableEditor)

//monitor wasted renders
whyDidYouRender(React)
ReduxTableEditor.whyDidYouRender = true
RowEditor.whyDidYouRender = true

//Launch the UI
ReactDom.render(
  <Provider store={store}>
    <ReduxTableEditor />
  </Provider>,
  document.getElementById("app")
)