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

let formatError = function (e, source, lineFeed) {
  let message = source?'source: ' + source : ''
  
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
  const message = formatError(e, source, lineFeed)

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

//export default utils

export {formatError, displayError, isString, blobToBase64Strings, base64StringsToBlob, blobToArray}
export default {formatError, displayError, isString, blobToBase64Strings, base64StringsToBlob, blobToArray}
