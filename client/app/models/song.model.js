import {isString} from '../utils/util.js'
//import blobUtil from 'blob-util'
//import util from '../utils/util.js'
import 'babel-polyfill'

//const FETCH_TOOL = 'XHR'  //'fetch' 'none'
//sessionStorage doesn't work in firefox or chrome on the desktop giving errors about quota exceeded
//localStorage doesn't work in firefox or chrome on the desktop giving errors about quota exceeded
//const STORAGE_TOOL = 'localStorage'//'sessionStorage', 'localStorage', 'volatile', 'indexedDB', 'fileSystem'
//const MP3Type = 'audio/mpeg'
//const storage = STORAGE_TOOL === 'sessionStorage' ? sessionStorage : STORAGE_TOOL === 'localStorage' ? localStorage  : null

class Song {
  constructor(raw, storageStrategy, fetchStrategy, isReady=false)
  {
    this.artist = raw.artist
    this.genre = raw.genre
    this.title = raw.title
    this.album = raw.album
    this.file = raw.file
    this.storageStrategy = storageStrategy
    this.fetchStrategy = fetchStrategy
    this.isReady = isReady||this.hasData()
  }

  hasData() {
    if(this.isReady){
      return true
    }
    return this.storageStrategy.hasData(this)
/*
    switch(STORAGE_TOOL) {
      case 'volatile': return !!this.data
      case 'localStorage':
      case 'sessionStorage': return storage.getItem(this.file)
      default:
        alert('STORAGE_TOOL has an invalid value: ' + STORAGE_TOOL)
    }*/
  }

  storeData(data) {
    return this.storageStrategy.storeData(this, data)
    .then(() => this.isReady = true)
    /*
    return new Promise((resolve, reject) => {
      switch(STORAGE_TOOL) {
        case 'volatile': this.data = data
          resolve()
          break
        case 'localStorage':
        case 'sessionStorage': util.blobToBase64Strings(data, this.file).then((strings) => {
          //alert(this.file + '\n' + data.size + '\n' + str.length)
          strings.map((o, i)=>{
            if(i===0){
              storage.setItem(o.key, JSON.stringify({length:o.length, type:o.type}))
            } else {
              storage.setItem(o.key, o.base64String)
            }
          })
          resolve()
        })
          break
        default:
          reject('STORAGE_TOOL has an invalid value: ' + STORAGE_TOOL)
      }
    }).then(()=>{
      this.isReady = true
    })
    */
  }

  reset() {
    if(this.URL) {
      window.URL.revokeObjectURL(this.URL)
      delete this.URL
    }
    if(this.tempData) {
      delete this.tempData
    }
  }

  prepare() {
    return this.storageStrategy.prepare(this)
    .then(null, (err)=> {
      return null
    })
    /*
    return new Promise((resolve, reject) => {
      switch(STORAGE_TOOL) {
        case 'volatile': this.tempData = this.data
          this.URL = window.URL.createObjectURL(this.tempData)
          resolve(this.URL)
          break
        case 'localStorage':
        case 'sessionStorage': {
          const info = JSON.parse(storage.getItem(this.file))
          let stringArray = []
          for(let i = 1;i<=info.length;i++) {
            stringArray.push(storage.getItem(this.file + '-' + i))
          }
          this.tempData = util.base64StringsToBlob(stringArray, info.type)
          this.URL = window.URL.createObjectURL(this.tempData)
          resolve(this.URL)
        }
          break
        default:
          reject('STORAGE_TOOL has an invalid value: ' + STORAGE_TOOL)
      }
    })*/
  }

  fetchData() {
    if(this.isReady) {
      return Promise.resolve(this)
    }
    return this.fetchStrategy.fetch('data/' + this.file)
    .then((data) => {
      return this.storeData(data)
    })
    .then(() => this)

    /*switch(FETCH_TOOL) {
      case 'XHR': return this.fetchWithXHR()
      case 'fetch': return this.fetchWithFetch()
      case 'none': this.isReady = true
        return Promise.resolve(this)
    }*/
  }

  /*this version works on the desktop, but not in safari or chrome on the iphone
  */
/*  fetchWithFetch() {
    return fetch('data/' + this.file)
    .then((response)=> {
      if(response.ok) {
        return response.blob()
      } else {
        throw response
      }})
    .then((data)=>{
      return this.storeData(data)
    })
    .then(()=>this)
  }
*/
  /*this function seems to work on the iphone, while the other two don't.  It doesn't work with firefox 52
  */
  /*fetchWithXHR() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      xhr.open('GET', 'data/' + this.file)
      xhr.responseType = 'blob'
      //let self = this
      xhr.onload = (e) => {
        if(xhr.status == 200) {
          if(xhr.responseType !== 'blob') {
            alert('xhr.responseType: ' + xhr.responseType)
          }
          resolve(this.storeData(xhr.response))
        }
      }
      xhr.onerror = function(e) {
        reject('XHR failed: ' + e.target.status)
      }
      xhr.send()
    })
    .then(()=>this)
  }
*/

  matchesFilter (filter) {
    //always filter songs that don't have loaded data
    if(!this.isReady) {
      return false
    }
    let ands = filter.toUpperCase().split(/\s/)
    return ands.every((filter) => {
      return Object.keys(this).some((field) => {
        return field !== 'file' && isString(this[field]) && this[field].toUpperCase().includes(filter)
      })
    })
  }
}

export default Song
