import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"

function Frame(props) {
  return <div id={props.name} >
    {props.children}
  </div>
}

function Nav(props) {
  return <div class="pane" style={{ backgroundColor: props.color || "yellow" }} >
    <p><Link target="_top" to="/red">Choose Red</Link></p>
    <p><Link target="_top" to="/green">Choose Green</Link></p>
    <p><Link target="_top" to="/">Reset</Link></p>
  </div>
}

function FrameSet(props) {
  return <Router>
    <Frame name="left">
      <Switch>
        <Route exact path="/" >
          <Nav />
        </Route>
        <Route path="/green" >
          <Nav color="green" />
        </Route>
        <Route path="/red" >
          <Nav color="red" />
        </Route>
      </Switch>
    </Frame>
    <Frame name="right">
      <Switch>
        <Route exact path="/" >
          <Nav />
        </Route>
        <Route path="/green" >
          <Nav color="green" />
        </Route>
        <Route path="/red" >
          <Nav color="red" />
        </Route>
      </Switch>
    </Frame>
  </Router>
}

export default FrameSet;
