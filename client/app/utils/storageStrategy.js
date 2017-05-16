import util from './util.js'

const storageStrategy = {
  volatile: {

    storeData: (theSong, data) => {
      theSong.data = data
      return Promise.resolve()
    },

    prepare: (theSong) => {
      return Promise.resolve()
      .then(() => {
        theSong.tempData = theSong.data
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
    },

    hasData: (theSong) => {
      return !!theSong.data
    },

    clearData: () => {

    },

    getDataUsage: () => {
      return 0
    }
  },

  sessionAndLocalStorage: {
    storeData: (storage, theSong, data) => {
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
    prepare: (storage, theSong) => {
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
    hasData: (storage, theSong) => {
      return storage.getItem(theSong.file)
    },

    clearData: (storage) => {
      storage.clear()
    },

    getDataUsage: (storage) => {
      return Object.keys(storage).reduce((acc, val) => {
        return acc += storage.getItem(val).length * 2
      }, 0)/1024/1024
    }
  },

  localStorage: {
    storeData: (theSong, data) => {
      return storageStrategy.sessionAndLocalStorage.storeData(localStorage, theSong, data)
    },
    prepare: (theSong) => {
      return storageStrategy.sessionAndLocalStorage.prepare(localStorage, theSong)
    },
    hasData: (theSong) => {
      return storageStrategy.sessionAndLocalStorage.hasData(localStorage, theSong)
    },
    clearData: () => {
      return storageStrategy.sessionAndLocalStorage.clearData(localStorage)
    },
    getDataUsage: () => {
      return storageStrategy.sessionAndLocalStorage.getDataUsage(localStorage)
    }
  },

  sessionStorage: {
    storeData: (theSong, data) => {
      return storageStrategy.sessionAndLocalStorage.storeData(sessionStorage, theSong, data)
    },
    prepare: (theSong) => {
      return storageStrategy.sessionAndLocalStorage.prepare(sessionStorage, theSong)
    },
    hasData: (theSong) => {
      return storageStrategy.sessionAndLocalStorage.hasData(sessionStorage, theSong)
    },
    clearData: () => {
      return storageStrategy.sessionAndLocalStorage.clearData(sessionStorage)
    },
    getDataUsage: () => {
      return storageStrategy.sessionAndLocalStorage.getDataUsage(sessionStorage)
    }
  }
}

export default storageStrategy
