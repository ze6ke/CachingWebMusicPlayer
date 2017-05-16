import {isString} from '../utils/util.js'
//import blobUtil from 'blob-util'
import util from '../utils/util.js'
import 'babel-polyfill'

const FETCH_TOOL = 'XHR'  //'fetch' 'none'
//sessionStorage doesn't work in firefox or chrome on the desktop giving errors about quota exceeded
//localStorage doesn't work in firefox or chrome on the desktop giving errors about quota exceeded
const STORAGE_TOOL = 'sessionStorage'//'sessionStorage', 'volatile', 'indexedDB', 'fileSystem'
//const MP3Type = 'audio/mpeg'
const storage = STORAGE_TOOL === 'sessionStorage' ? sessionStorage : STORAGE_TOOL === 'localStorage' ? localStorage  : null

class Song {
  constructor(raw, isReady=false)
  {
    this.artist = raw.artist
    this.genre = raw.genre
    this.title = raw.title
    this.album = raw.album
    this.file = raw.file
    this.isReady = isReady||this.hasData()
  }

  hasData() {
    if(this.isReady){
      return true
    }
    switch(STORAGE_TOOL) {
      case 'volatile': return !!this.data
      case 'localStorage':
      case 'sessionStorage': return storage.getItem(this.file)
      default:
        alert('STORAGE_TOOL has an invalid value: ' + STORAGE_TOOL)
    }
  }

  storeData(data, done) {
    switch(STORAGE_TOOL) {
      case 'volatile': this.data = data
        done()
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
        done()
        //storage.setItem(this.file, str)
      })
        break
      default:
        alert('STORAGE_TOOL has an invalid value: ' + STORAGE_TOOL)
        done()
    }
    this.isReady = true
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

  prepare(done) {
    switch(STORAGE_TOOL) {
      case 'volatile': this.tempData = this.data
        this.URL = window.URL.createObjectURL(this.tempData)
        done(this.URL)
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
        done(this.URL)
      }
          /*.then((blob) => {
            this.tempData = blob
            this.URL = window.URL.createObjectURL(this.tempData)
            done(this.URL)
          })*/
        break
      default:
        alert('STORAGE_TOOL has an invalid value: ' + STORAGE_TOOL)
    }
  }

  fetchData(cb) {
    if(this.isReady) {
      cb()
      return
    }
    switch(FETCH_TOOL) {
      case 'XHR': this.fetchWithXHR(cb)
        break
      case 'fetch': this.fetchWithFetch(cb)
        break
      case 'none': this.isReady = true
        break
    }
  }

  /*this version works on the desktop, but not in safari or chrome on the iphone
  */
  fetchWithFetch(cb) {
    fetch('data/' + this.file)
    .then((response)=> {
      if(response.ok) {
        response.blob()
        .then((data)=>{
          this.storeData(data)
          cb()
        }, (err) => {cb(err)})
      } else {
        cb(response)
      }
    }, (response) => {
      cb(response)
    })
  }

  /*this function seems to work on the iphone, while the other two don't.  It doesn't work with firefox 52
  */
  fetchWithXHR(cb) {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', 'data/' + this.file)
    xhr.responseType = 'blob'
    //let self = this
    xhr.onload = (e) => {
      if(xhr.status == 200) {
        if(xhr.responseType !== 'blob') {
          alert('xhr.responseType: ' + xhr.responseType)
        }
        this.storeData(xhr.response)
        cb()
      }
    }
    xhr.onerror = function(e) {
      alert('XHR failed: ' + e.target.status)
    }
    xhr.send()
  }

  /*There doesn't seem to be any way to make jquery give me access to get a blob.
  Converting the string returned to an array and then a blob behaves terribly.
  */
  /*
  fetchSongWithJQuery(song, cb) {
    $.ajax({
      url:'data/' + song.file})
    .done((data, textStatus, jqXHR) => {
      if(jqXHR.responseType !== 'blob') { //this doesn't seem to exist
        alert('jqXHR.responseType: ' + jqXHR.responseType)
      }
      Model.storeSongData(song, new Blob(data.split(''), {type:MP3Type}))
      //song.data = new Blob(data.split(''), {type:'MP3Type'})
      cb()
    })
    .fail((jqXHR, textStatus) => {
      cb(textStatus)
    })
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
