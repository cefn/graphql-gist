import React from "react"
import ReactDom from "react-dom"
import { Provider } from "react-redux"
import whyDidYouRender from "@welldone-software/why-did-you-render"

import TableEditor from "./component/TableEditor"
import RowEditor from "./component/RowEditor"

import { connect } from "react-redux"
import { store, changeFocus, saveRow } from "./control"

/* CONFIGURE REDUX CONNECTOR */

//map redux store to react props 
const stateToProps = ({ focusType, focusId, schemas, rows, ids } /*, ownProps*/) => ({
  focusType,
  focusTypeIds: ids[focusType] || [],
  focusTypeSchema: schemas[focusType],
  focusId,
  focusIdRow: rows[focusId],
})

//map redux actions to react props 
const dispatchToProps = (/*dispatch*/) => ({
  changeFocus,
  saveRow
})

//redux-react adapter
const connectToRedux = connect(stateToProps, dispatchToProps)

//create editor component with Redux binding
const ReduxTableEditor = connectToRedux(TableEditor)

//monitor wasted renders
//whyDidYouRender(React)
ReduxTableEditor.whyDidYouRender = true
RowEditor.whyDidYouRender = true

//Launch the UI
ReactDom.render(
  <Provider store={store}>
    <ReduxTableEditor />
  </Provider>,
  document.getElementById("app")
)