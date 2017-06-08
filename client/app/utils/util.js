//import blobUtil from 'blob-util'
//import base64js from 'base64-js'
let base64js = require('base64-js')

let isString = function(v) {
  return typeof v === 'string' || v instanceof String
}

let getAllKeys = function (o) {
  let a = []
  for(let e in o) {
    a.push(e)
  }
  return a
}

let formatError = function (e, source) {
  let message = source?'source: ' + source : ''
  let lineFeed = '\n'

  if(e.target){
    if(e.target.error) {
      message += lineFeed + 'target.error: ' + formatError(e.target.error, '', lineFeed)
    } else {
      message += 'target: ' + getAllKeys(e.target)
    }
  } else if(e.name) {
    message += 'name: ' + e.name
  }
  else if(isString(e)){
    message += e
  }
  else {
    message += getAllKeys(e)//Object.keys(e)//JSON.stringify(e) 
  }
  if(e.message) {
    message += lineFeed + 'message: ' + e.message
  }
  if(message.length === 0) {
    message = 'no info could be determined'
  }
  return message
}

let displayError = function (e, source) {
  let el = document.getElementById('errors')
  const lineFeed = el?'<br>':lineFeed 
  const message = formatError(e, source, lineFeed).replace(/\n/g, lineFeed)

  if(el) {
    el.innerHTML += '<p>' + message
  }
  else {
    alert (message)
  }
}


let blobToArray = (blob) => {
  return new Promise((resolve, reject) => {
    let fr = new FileReader()
    fr.addEventListener('loadend', () => {
      resolve(fr.result)
    })
    fr.addEventListener('onerror', (err) => {
      reject(err)
    })
    fr.readAsArrayBuffer(blob)
  })
}

let blobToBase64Strings = (blob, keyBase, size=1000000) => {
  return blobToArray(blob).then((arr) => {
    let retval = [{key: keyBase, length: Math.ceil(blob.size/size), type: blob.type}]
    for(let i=0;i*size<arr.byteLength;i++) {
      const length = (i+1)*size<arr.byteLength?size:arr.byteLength-(i)*size
      let uint8 = new Uint8Array(arr, i*size, length)
      let base64String = base64js.fromByteArray(uint8)
      retval.push({
        key: keyBase + '-' + (i+1),
        base64String
      })
    }
    return retval
  })
}


let base64StringsToBlob = (stringArray, type) => {
  const bas = stringArray.map((str)=>base64js.toByteArray(str))
  const blob = new Blob(bas, {type})
  return blob
}

let promisify = (fn, args) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn(...args))
    } catch (e) {
      reject(e)
    }
  })
}

let throttle = {
  promisePerSecondGenerator: (promisesPerSecond) => {
    let resolverArray = []
    let resolverRunning = false

    let releasePromise = () => {
      let {resolve, val} = resolverArray.shift()
      resolve(val)//call the first resolver put on the array
      if(resolverArray.length) {
        setTimeout(releasePromise, 1000/promisesPerSecond)
      } else {
        resolverRunning = false
      }
    }

    return (val) => {
      let thisPromise = new Promise((resolve) => {
        resolverArray.push({resolve, val})
      })

      if(!resolverRunning) {
        setTimeout(releasePromise, 1000/promisesPerSecond)
        resolverRunning = true
      }

      return thisPromise
    }
  },
  /*this function accepts a function and a minDelay value and returns a new function.  When the new function is called, it will call the underlying
   * function if that function hasn't been called in minDelay ms.  Otherwise, it waits until minDelay ms have passed and calls the function with
   * whatever arguments were last provided (the underlying function needs to be idempotent to get good results).
   * In both cases, it returns a promise that will completed/reject based on the execution of the function
   */
  basic: (fn, minDelay = 0) => {
    let lastCall = 0 //current time in ms since epoch
    let currentArgs = null
    let timerHandle = null
    let currentPromise = null
    return (...args) => {
      const now = +new Date()
      if(!timerHandle && now > lastCall + minDelay) { //we can run the function right now and have no commitments otherwise
        lastCall = now
        return promisify(fn, args)
      } else { //we can't run immediately or we've handed out a promise someplace and somebody's (potentially) waiting on results
        currentArgs = args
        if(!timerHandle) {
          currentPromise = new Promise((resolve, reject) => {
            timerHandle = setTimeout(() => {
              lastCall = now
              try {
                let retVal = fn(...currentArgs)
                resolve(retVal)
              } catch(e) {
                reject(e)
              } finally {
                currentArgs = null
                currentPromise = null
                timerHandle = null
              }
            }, minDelay + lastCall - now)
          })
        }  //we have already set a timer and handed out a promise, just return the existing promise
        return currentPromise
      }
    }
  }
  ,
  promiseTicketGenerator: (numberOfTickets, timeoutPeriod=60000) => {
    let resolverArray = []
    let availableTickets = numberOfTickets
    
    let releaseTicket = () => {
      if(availableTickets && resolverArray.length) {
        availableTickets--
        resolverArray.shift()()
      }
    }
    let generateTicket = () => {
      let timerHandle = null
      let thePromise = null

      let reclaimTicket = () => {
        console.error('ticket expired, either the timeout value is too low, or you forgot to release it')
        theTicket.returnTicket()
      }

      let theTicket = {
        resolve: (arg) => {
          if (!thePromise) {
            thePromise = new Promise((resolve) => {
              resolverArray.push(() => {
                timerHandle = setTimeout(reclaimTicket, timeoutPeriod)
                resolve(arg)
              })
            })
            releaseTicket()
          }
          return thePromise
        },
        returnTicket: function() {
          clearTimeout(timerHandle)
          availableTickets++
          releaseTicket()
        },
        returnOnSuccess: function(v) {
          this.returnTicket()
          return v
        }, 
        returnOnError: function(e) {
          this.returnTicket()
          throw e
        }
      }
      theTicket.returnOnSuccess = theTicket.returnOnSuccess.bind(theTicket)
      theTicket.returnOnError = theTicket.returnOnError.bind(theTicket)
      return theTicket
    }
    return generateTicket
  }
}

let isMobile = (userAgent) => /iphone|ipad|ipod|android/i.test(userAgent)
//export default utils
export {isMobile, throttle, formatError, displayError, isString, blobToBase64Strings, base64StringsToBlob, blobToArray}
export default {isMobile, throttle, formatError, displayError, isString, blobToBase64Strings, base64StringsToBlob, blobToArray}
