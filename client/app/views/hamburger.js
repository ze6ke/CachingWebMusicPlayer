let theCheckbox=undefined //set by a ref
const hideThen = (action) => () => {
  theCheckbox.checked=false
  return action()
  //return setTimeout(action, 100) //calling the action freezes the animation in chrome, better to do it first or
  //let the animation complete
}

const Hamburger = ({clearCachedData, showDataUsage, resetCachedData}) => (
  <nav><input type="checkbox" id="hamburger-check" ref={(el)=>theCheckbox=el} />
    <label htmlFor="hamburger-check" className="fa fa-bars hamburger-icon"></label>
    <ul className="menu">
      <li onClick={hideThen(clearCachedData)}>Clear Cached Data</li>
      <li onClick={hideThen(showDataUsage)}>Show Data Usage</li>
      <li onClick={hideThen(resetCachedData)}>Reset Data Store</li>
    </ul>
  </nav>
)

export default Hamburger
