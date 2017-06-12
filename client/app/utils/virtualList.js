//This library takes a large list of components that don't all fit on the screen and causes the dom to only display the ones that fit on the screen.
//It significantly improves rendering time for the songlist component when it has 5,000 songs.
//This library is based on react-virtual-list and uses inheritence to extend it.  It fixes a bug with the styles and allows the code to specify a
//starting scroll position.  That feature is important to prevent filtering from leaving the scroll position far below the visible window.


import VirtualList from 'react-virtual-list'

const VirtualCanvas = ({virtual, itemHeight, children, ...props}) => (
  <div id="theCanvas" style={virtual.style}>
    {children({...props, items: virtual.items, itemHeight})}
  </div>
)

const VirtualWithScroll = (Virtual, getScrollingContainer=f=>window) => (options) => (controls) => {
  const correctedControls = ({virtual, ...props}) => {
    let correctedVirtual = {...virtual}
    correctedVirtual.style.height = virtual.style.height - virtual.style.paddingTop
    return VirtualCanvas({...props, virtual: correctedVirtual, children: controls})
  }
  let vlist = Virtual(options)(correctedControls)
  return class vlistWithScroll extends vlist {
    constructor (props) {
      super(props)
      if(props.startingElement!==undefined) {
        this.startingElement = props.startingElement
      }
    }
    
    componentDidMount() {
      super.componentDidMount && super.componentDidMount()
      if(this.startingElement!==undefined) {
        this.scrollToElementNumber(this.startingElement)
      }
    }
    componentDidUpdate(prevProps, prevState) {
      super.componentDidUpdate && super.componentDidUpdate(prevProps, prevState)
      if(this.startingElement!==undefined && this.props.items !== prevProps.items) {
        this.scrollToElementNumber(this.startingElement)
      }
    }

    scrollToElementNumber (id) {
      const theContainer = getScrollingContainer()
      if(theContainer === window) {
        window.scrollTo(0, document.body.getBoundingClientRect().top + 
          window.scrollY + this.props.itemHeight * id)
      }
      else {
        alert('not implemented')
      }
    }
  }
}

const MyVirtualList = VirtualWithScroll(VirtualList)

export default MyVirtualList
