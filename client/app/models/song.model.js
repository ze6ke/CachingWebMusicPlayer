import {isString} from '../utils/utils.js'

class Song {
  constructor(raw)
  {
    this.artist = raw.artist
    this.genre = raw.genre
    this.title = raw.title
    this.album = raw.album
    this.file = raw.file
    this.isReady = false
  }

  storeData(data) {
    this.isReady = true
    this.data = data
  }

  fetchData(cb) {
    const FETCH_TOOL = 'XHR'  //the other two values don't work on all browsers
    switch(FETCH_TOOL) {
      case 'XHR': this.fetchWithXHR(cb)
        break
      /*case 'jquery': this.fetchSongWithJQuery(song, cb)
        break
      */
      case 'fetch': this.fetchWithFetch(cb)
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
          //song.data = data.slice(0, data.size, MP3Type)
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

/*this function seems to work on the iphone, while the other two don't
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


  reset() {
    if(this.URL) {
      window.URL.revokeObjectURL(this.URL)
      delete this.URL
    }
  }

  prepare() {
    this.URL = window.URL.createObjectURL(this.data)
  }

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
