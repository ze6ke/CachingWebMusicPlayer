const rt = 'arraybuffer'

const fetchStrategy = {
  none: {
    fetch: (url) => Promise.resolve()
  },
  
  fetch: {
    //this version works on the desktop, but not in safari or chrome on the iphone
    fetch: (url) => {
      return fetch(url)
      .then((response)=> {
        if(response.ok) {
	  if(rt==='blob') {
            return response.blob()
	  } else {
	    return response.arrayBuffer()
	  }
        } else {
          throw response
        }
      })
    }
  },
  XHR: {
    //this function seems to work on the iphone, while the other two don't.  It doesn't work with firefox 52
    fetch: (url) => {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.responseType = rt
        xhr.onload = (e) => {
          if(xhr.status == 200) {
            if(xhr.responseType !== rt ) {
              reject({name:'invalid reponseType', message: `expected "${rt}", received "${xhr.responseType}"`})
            }
            resolve(xhr.response)
          }
        }
        xhr.onerror = function(e) {
          reject('XHR failed: ' + e.target.status)
        }
        xhr.send()
      })
    }
  }
}


export default fetchStrategy
