import React from "react"
import ReactDom from "react-dom"
import { Provider } from "react-redux"
import whyDidYouRender from "@welldone-software/why-did-you-render"

import { launchStore } from "./control"
import TableEditor from "./component/TableEditor"
import RowEditor from "./component/RowEditor"

//launch the application store and logic
const store = launchStore()

//monitor wasted renders
whyDidYouRender(React)
TableEditor.whyDidYouRender = true
RowEditor.whyDidYouRender = true

//Launch the UI
ReactDom.render(
  <Provider store={store}>
    <TableEditor />
  </Provider>,
  document.getElementById("app")
)



