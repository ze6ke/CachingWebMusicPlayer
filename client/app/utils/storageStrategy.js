import util from './util.js'

//this allows me to extract out the storage method (and change it with a simple modification to index.js).
//volatile stores everything in memory, stub throws everything away (for testing purposes) and indexedDB stores everything in indexedDB.
//local and session storage were implemented in earlier versions, but were removed because I couldn't imagine a situation when they would seem useful.

/*
 * estimate item size.  Won't handle recursive items well but won't crash (it stops after 5 levels of nesting)
 */
function getItemSize(item, depth=1) {
  if(item.byteLength !== undefined) {
    return item.byteLength
  } else if(item.size !== undefined) {
    return item.size
  } else if(item.length !== undefined) {
    return item.length
  } else if (depth >= 5) {
    return 0
  } else if (typeof(item) == 'object') {
    return Object.keys(item).reduce((acc, v) => acc += getItemSize(v, depth+1), 0)
  } else {
    return 0
  }
}

let volatile = {
  name: 'volatile',
  reset: function() {
    return Promise.resolve()
  },

  storeData: function(theSong, data) {
    theSong.data = data
    return Promise.resolve()
  },

  prepare: function(theSong) {
    return Promise.resolve()
      .then(() => {
        theSong.tempData = new Blob([theSong.data],{type: theSong.type})
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
  },
  getConfig: function() {
    return Promise.resolve()
  },

  hasData: function(theSong) {
    return Promise.resolve(!!theSong.data)
  },

  clearData: function() {
    return Promise.resolve()
  },

  getDataUsage: function() {
    return Promise.resolve(0)
  }
}

let stub = {...volatile, 
  storeData: function(theSong, data) {
    theSong.data = 1
    return Promise.resolve()
  }
}


let indexedDB = {
  name: 'indexedDB',
  indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
  IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
  dbVersion: 5,
  dbName: 'songs',
  objectStoreName: 'songs',
  initialize: function()  {
    return new Promise((resolve, reject) => {
      this.request = this.indexedDB.open(this.dbName, this.dbVersion)

      this.request.onupgradeneeded = (e) => {
        let db = e.target.result
        let os = this.createObjectStore(db)

        os.transaction.oncomplete = () => {
          let tran = db.transaction(['songs'], 'readwrite')
          let os = tran.objectStore('songs')
          os.put(new Map(), 'config')
        }
      }
      this.request.onerror = (e) => {
        reject(e)
      }

      this.request.onsuccess = (e) => {
        this.db = this.request.result
        resolve(storageStrategy.indexedDB)
      }
    })
  },
  createObjectStore: function(db) {
    if(db.objectStoreNames.contains(this.objectStoreName)) {
      db.deleteObjectStore(this.objectStoreName)
    }
    return db.createObjectStore(this.objectStoreName)
  },
  storeData: function(theSong, data) {
    return this.store(theSong.file, data)
      .then((e) => {
        this.config.set(theSong.file, true)
        return this.storeConfig()
          .then(() => null)
      })
  },
  store: function(key, data) {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([this.objectStoreName], 'readwrite')
      let os = transaction.objectStore(this.objectStoreName)
      let put = os.put(data, key)

      put.onsuccess = (e) => {
        resolve(e)
      }
      put.onerror = (e) => {
        let retval = e.error?e.error:put.error?put.error:transaction.error //no guaranty about where the error info will actually show up
        reject(retval)
      }
    })
  },


  prepare: function(theSong) {

    return new Promise((resolve, reject) => {

      let transaction = this.db.transaction([this.objectStoreName], 'readonly')
      let get = transaction.objectStore(this.objectStoreName).get(theSong.file)

      get.onsuccess = (e) => {
        theSong.tempData = new Blob([e.target.result], {type: theSong.type})
        resolve()
      }
      get.onerror = (e) => {
        reject(e)
      }
    })
      .then(() => {
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
  },

  hasData: function(theSong) {
    return Promise.resolve(this.config.has(theSong.file))
  },
  getConfig() {//there's no function to list keys without retrieving data, and the system crashes if you make thousands of asynch requests
    //to pull back keys, so I started tracking what files have been loaded on my own.  This will
    //certainly be a source of bugs, but it still seems like the best way to deal with that problem.
    return new Promise((resolve, reject) => {

      let transaction = this.db.transaction([this.objectStoreName], 'readonly')
      let get = transaction.objectStore(this.objectStoreName).get('config')

      get.onsuccess = (e) => {
        this.config = e.target.result
        if(!this.config) {
          this.config = new Map()
        }
        resolve()
      }
      get.onerror = (e) => {
        reject(e)
      }
    })


  },

  reset: function() {
    this.db && this.db.close()

    let thePromise = new Promise((resolve, reject) => {
      let deleteRequest
      deleteRequest = this.indexedDB.deleteDatabase(this.dbName)
      deleteRequest.onsuccess = (e) => {
        resolve(this.initialize())
      }
      deleteRequest.onerror = (e) => {
        reject(e)
      }
    })

    return thePromise
  },

  getDataUsage: function() {
    return new Promise((resolve, reject) => {
      let size = 0
      let cursorRequest = this.db.transaction([this.objectStoreName], 'readonly')
        .objectStore(this.objectStoreName)
        .openCursor()
      cursorRequest.onerror = (e) => reject(e)
      cursorRequest.onsuccess = (e) => {
        let cursor = e.target.result
        if(cursor) {
          size += getItemSize(cursor.value)
          cursor.continue() //on success will be called again on the next item (or with a falsey e.target.result)
        } else {
          resolve(size/1024/1024)
        }
      }
    })
  },

  clearData: function() {
    return new Promise((resolve, reject) => {
      let cursorRequest = this.db.transaction([this.objectStoreName], 'readwrite')
        .objectStore(this.objectStoreName)
        .openCursor()

      let deletionPromiseArray = []
      cursorRequest.onerror = (e) => reject(e)
      cursorRequest.onsuccess = (e) => {
        let cursor = e.target.result
        if(cursor) {
          let request = cursor.delete()

          let newPromise = new Promise((resolve, reject) => {
            request.onsuccess = () => resolve()
          })
          deletionPromiseArray.push(newPromise)

          cursor.continue() //on success will be called again on the next item (or with a falsey e.target.result)
        } else {
          Promise.all(deletionPromiseArray)
            .then(()=>resolve())
        }
      }
    })
  }
}

//this needs to be done out here to give the inner function access to this
indexedDB.storeConfig = util.throttle.basic(function() {
  return this.store('config', this.config)
}.bind(indexedDB), 250)

const storageStrategy = {
  indexedDB,
  volatile,
  stub,

  getStrategy: function(type) {
    switch (type) {
      case 'volatile': return Promise.resolve().then(() => storageStrategy.volatile)
      case 'stub': return Promise.resolve().then(() => storageStrategy.stub)
      case 'indexedDB': return storageStrategy.indexedDB.initialize()
      default: throw {name: 'type undefined', message: 'The type passed in is not valid: ' + type}
    }
  },
  resetStrategy: function(type) {
    switch (type) {
      case 'indexedDB': return storageStrategy.indexedDB.reset()
      case 'stub': //fall through
      case 'volatile':return Promise.resolve()
      default: throw {name: 'type undefined', message: 'The type passed in is not valid: ' + type}
    }
  }
}


export default storageStrategy
