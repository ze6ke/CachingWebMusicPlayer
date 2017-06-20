

function requiret(library) {
  const startTime = Date.now()
  const retval = require(library)
  const totalTime = Date.now() - startTime
  this.times[library]=totalTime
  this.notifications && totalTime && console.log(`Loading ${library}: ${totalTime}ms`)
  return retval
}

let retval = {
  times: {}, 
  notifications: true
}
retval.require = requiret.bind(retval)

module.exports = retval


