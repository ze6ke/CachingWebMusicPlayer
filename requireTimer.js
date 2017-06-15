

function requiret(library) {
  const startTime = +new Date()
  const retval = require(library)
  const totalTime = +new Date() - startTime
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


