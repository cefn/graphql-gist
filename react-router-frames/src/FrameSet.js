import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

function Frame(props) {
  return <div id={props.name} >
    {props.children}
  </div>
}

function View(props) {
  return <div class="pane" style={{ backgroundColor: props.color || "yellow" }} >
    <p><Link target="_self" to="/red">Choose Red</Link></p>
    <p><Link target="_self" to="/green">Choose Green</Link></p>
    <p><Link target="_self" to="/">Reset</Link></p>
  </div>
}

function FrameSet(props) {
  return <Router>
    <Frame name="left">
      <Switch>
        <Route exact path="/" >
          <View />
        </Route>
        <Route path="/green" >
          <View color="green" />
        </Route>
        <Route path="/red" >
          <View color="red" />
        </Route>
      </Switch>
    </Frame>
    <Frame name="right">
      <Switch>
        <Route exact path="/" >
          <View />
        </Route>
        <Route path="/green" >
          <View color="green" />
        </Route>
        <Route path="/red" >
          <View color="red" />
        </Route>
      </Switch>
    </Frame>
  </Router>
}

export default FrameSet;
