import React from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"

function Frame(props) {
  return <div id={props.name} >
    {props.children}
  </div>
}

function View(props) {
  let color = props.pathSuffix
  if (!color) {
    color = "yellow"
  }
  return <div class="pane" style={{ backgroundColor: color }} >
    <p><Link to="/left/red">Left Red</Link></p>
    <p><Link to="/right/red">Right Red</Link></p>
    <p><Link to={`${props.pathPrefix}red`}>Self Red</Link></p>
    <p><Link to="/left/green">Left Green</Link></p>
    <p><Link to="/right/green">Right Green</Link></p>
    <p><Link to={`${props.pathPrefix}green`}>Self Green</Link></p>
    <p><Link to="/left">Left Reset</Link></p>
    <p><Link to="/right">Right Reset</Link></p>
    <p><Link to={`${props.pathPrefix}`}>Self Reset</Link></p>
  </div>
}

function FilterPath(props) {
  return <Route render={({ location: { pathname } }) => {
    const { pathPrefix } = props
    let mergeProps = { pathPrefix }
    if (pathname.startsWith(pathPrefix)) {
      const pathSuffix = pathname.slice(pathPrefix.length)
      mergeProps = { ...mergeProps, pathSuffix }
    }
    return React.Children.map(props.children, child => React.cloneElement(child, mergeProps))
  }} />
}

function FrameSet(props) {
  return <Router>
    <FilterPath pathPrefix="/left/">
      <View />
    </FilterPath>
    <FilterPath pathPrefix="/right/">
      <View />
    </FilterPath>
  </Router>
}

export default FrameSet;
