import React from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"

function View(props) {
  let color = props.pathSuffix
  if (!color) {
    color = "yellow"
  }
  return <div className="pane" style={{ backgroundColor: color }} >
    <p><Link to="/left/red">Left Red</Link></p>
    <p><Link to="/left/green">Left Green</Link></p>
    <p><Link to="/left">Left Reset</Link></p>
    <p><Link to="/right/red">Right Red</Link></p>
    <p><Link to="/right/green">Right Green</Link></p>
    <p><Link to="/right">Right Reset</Link></p>
    <p><Link to={`${props.pathPrefix}red`}>Self Red</Link></p>
    <p><Link to={`${props.pathPrefix}green`}>Self Green</Link></p>
    <p><Link to={`${props.pathPrefix}`}>Self Reset</Link></p>
  </div>
}

function FilterPath(filterProps) {
  const { pathPrefix } = filterProps
  return <Route render={(routeProps) => {
    const { location: { pathname } } = routeProps
    let pathSuffix
    if (pathname.startsWith(pathPrefix)) {
      pathSuffix = pathname.slice(pathPrefix.length)
    }
    return React.Children.map(filterProps.children, child => React.cloneElement(child, { pathPrefix, pathSuffix }))
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
