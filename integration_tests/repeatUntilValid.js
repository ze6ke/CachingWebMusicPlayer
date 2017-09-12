const sleep = require('./sleep')

//this function calls action every 'delay' ms until either action resolves its promise or 'timeout' ms have passed.
//If action doesn't return a promise this will fail
function repeatUntilValid(action, delay, timeout) {
  const startTime = (new Date).getTime()
  let doIt = () => {
    return action()
      .catch((err)=>{
        if((new Date).getTime()-startTime > timeout) {
          return err
        } else {
          return sleep(delay).then(doIt)
        }
      })
  }
  return doIt()

}

module.exports = repeatUntilValid
