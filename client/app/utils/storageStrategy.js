import util from './util.js'



const storageStrategy = {
  getStrategy: function(type) {
    switch (type) {
      case 'volatile': return Promise.resolve().then(() => storageStrategy.volatile)
      case 'sessionStorage': return Promise.resolve().then(() => storageStrategy.sessionStorage)
      case 'localStorage': return Promise.resolve().then(() => storageStrategy.localStorage)
      case 'indexedDB': return storageStrategy.indexedDB.initialize()
      default: throw {name: 'type undefined', message: 'The type passed in is not valid: ' + type}
    }
  },
  resetStrategy: function(type) {
    switch (type) {
      case 'indexedDB': return storageStrategy.indexedDB.reset()
      case 'volatile':
      case 'sessionStorage':
      case 'localStorage': return Promise.resolve()
      default: throw {name: 'type undefined', message: 'The type passed in is not valid: ' + type}
    }
  },
  volatile: {

    storeData: function(theSong, data) {
      theSong.data = data
      return Promise.resolve()
    },

    prepare: function(theSong) {
      return Promise.resolve()
      .then(() => {
        theSong.tempData = theSong.data
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
    },

    hasData: function(theSong) {
      return !!theSong.data
    },

    clearData: function() {

    },

    getDataUsage: function() {
      return 0
    }
  },

  sessionAndLocalStorage: {
    storeData: function(storage, theSong, data) {
      return util.blobToBase64Strings(data, theSong.file)
      .then((strings) => {
        strings.map((o, i)=>{
          if(i===0){
            storage.setItem(o.key, JSON.stringify({length:o.length, type:o.type}))
          } else {
            storage.setItem(o.key, o.base64String)
          }
        })
      })
    },
    prepare: function(storage, theSong) {
      return new Promise((resolve, reject) => {
        const info = JSON.parse(storage.getItem(theSong.file))
        let stringArray = []
        for(let i = 1;i<=info.length;i++) {
          stringArray.push(storage.getItem(theSong.file + '-' + i))
        }
        theSong.tempData = util.base64StringsToBlob(stringArray, info.type)
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        resolve(theSong.URL)
      })
    },
    hasData: function(storage, theSong) {
      return storage.getItem(theSong.file)
    },

    clearData: function(storage) {
      storage.clear()
    },

    getDataUsage: function(storage) {
      return Object.keys(storage).reduce((acc, val) => {
        return acc += storage.getItem(val).length * 2
      }, 0)/1024/1024
    }
  },

  localStorage: {
    storeData: function(theSong, data) {
      return storageStrategy.sessionAndLocalStorage.storeData(localStorage, theSong, data)
    },
    prepare: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.prepare(localStorage, theSong)
    },
    hasData: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.hasData(localStorage, theSong)
    },
    clearData: function() {
      return storageStrategy.sessionAndLocalStorage.clearData(localStorage)
    },
    getDataUsage: function() {
      return storageStrategy.sessionAndLocalStorage.getDataUsage(localStorage)
    }
  },

  sessionStorage: {
    storeData: function(theSong, data) {
      return storageStrategy.sessionAndLocalStorage.storeData(sessionStorage, theSong, data)
    },
    prepare: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.prepare(sessionStorage, theSong)
    },
    hasData: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.hasData(sessionStorage, theSong)
    },
    clearData: function() {
      return storageStrategy.sessionAndLocalStorage.clearData(sessionStorage)
    },
    getDataUsage: function() {
      return storageStrategy.sessionAndLocalStorage.getDataUsage(sessionStorage)
    }
  },

  indexedDB: {
    indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
    IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
    dbVersion: 1,
    dbName: 'songs',
    objectStoreName: 'songs',
    initialize: function()  {
      return new Promise((resolve, reject) => {
        this.request = this.indexedDB.open(this.dbName, this.dbVersion)

        this.request.onupgradeneeded = (e) => {
          this.createObjectStore(e.target.result)
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
      db.createObjectStore(this.objectStoreName)
    },
    storeData: function(theSong, data) {
      return new Promise((resolve, reject) => {
        let transaction = this.db.transaction([this.objectStoreName], 'readwrite')
        let put = transaction.objectStore(this.objectStoreName).put(data, theSong.file)

        put.onsuccess = (e) => resolve(e)
        put.onerror = (e) => reject(e)
      })
    },

    prepare: function(theSong) {
      return new Promise((resolve, reject) => {
        let transaction = this.db.transaction([this.objectStoreName], 'readonly')
        let get = transaction.objectStore(this.objectStoreName).get(theSong.file)

        get.onsuccess = (e) => {
          theSong.tempData = e.target.result
          resolve()
        }
        get.onerror = (e) => reject(e)
      })
      .then(() => {
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
    },

    hasData: function(theSong) {
      return null
    },

    reset: function() {
      let thePromise = new Promise((resolve, reject) => {
        let deleteRequest
        deleteRequest = this.indexedDB.deleteDatabase(this.dbName)
        deleteRequest.onsuccess = (e) => {
          resolve()
        }
        deleteRequest.onerror = (e) => {
          reject(e)
        }
      })

      return thePromise

    },

    getDataUsage: function() {
      return null
    },

    clearData: function() {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  }
}

export default storageStrategy
