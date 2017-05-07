import $ from 'jquery'

const MP3Type = 'audio/mpeg'

class Model {
  constructor(renderApp) {
    this.songlist = null
    this.filter = ''
    this.current = null
    this.renderApp = function () {renderApp(this)}
  }

  /*this version works on the desktop, but not in safari or chrome on the iphone
  */
  fetchSongWithFetch(song, cb) {
    fetch('data/' + song.file)
    .then((response)=> {
      if(response.ok) {
        response.blob()
        .then((data)=>{
          song.data = data.slice(0, data.size, MP3Type)
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
  fetchSongWithJQuery(song, cb) {
    $.ajax({
      url:'data/' + song.file})
    .done((data, textStatus, jqXHR) => {
      if(jqXHR.responseType !== 'blob') { //this doesn't seem to exist
        alert('jqXHR.responseType: ' + jqXHR.responseType)
      }
      song.data = new Blob(data.split(''), {type:'MP3Type'})
      cb()
    })
    .fail((jqXHR, textStatus) => {
      cb(textStatus)
    })
  }

/*this function seems to work on the iphone, while the other two don't
*/
  fetchSongWithXHR(song, cb) {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', 'data/' + song.file)
    xhr.responseType = 'blob'
    xhr.onload = function(e) {
      if(this.status == 200) {
        if(xhr.responseType !== 'blob') {
          alert('xhr.responseType: ' + xhr.responseType)
        }
        song.data = this.response
        cb()
      }
    }
    xhr.onerror = function(e) {
      alert('XHR failed: ' + e.target.status)
    }
    xhr.send()
  }

  fetchSong(song, cb) {
    const FETCH_TOOL = 'XHR'  //the other two values don't work on all browsers
    switch(FETCH_TOOL) {
      case 'XHR': this.fetchSongWithXHR(song, cb)
        break
      case 'jquery': this.fetchSongWithJQuery(song, cb)
        break
      case 'fetch': this.fetchSongWithFetch(song, cb)
        break
    }
  }

  fetchAllSongs() {
    this.songlist.forEach((song)=>this.fetchSong(song, ()=>{this.renderApp()}))
    //this.fetchSong(this.songlist[0], () => {  })
  }

  setSonglist (songlist) {
    this.songlist = songlist
    //this.changeCurrentSong(songlist[0])
    this.fetchAllSongs()
  }
  changeCurrentSong (song) {
    //revoke any previously active URLs
    if(this.current) {
      window.URL.revokeObjectURL(this.current.URL)
      this.current.URL = undefined
    }

    this.current = song
    this.current.URL = window.URL.createObjectURL(song.data)
    //alert('data: ' + (song.data))
    //alert('datalength: ' + (song.data && song.data.size))
    //alert('type: ' + song.data.type)
  }
  getCurrentSong () {
    return this.current
  }
  changeFilter (filter) {
    this.filter = filter
  }
  getNextSong () {
    const sortedSongList = this.songlist
    let seenCurrentSong = false
    const current = this.current
    const filter = this.filter

    function takeAPass() {
      return sortedSongList.findIndex((thisSong) => {
        if(seenCurrentSong) {
          return Model.songMatchesFilter(thisSong, filter)
        }
        else {
          if(thisSong.file === current.file) {
            seenCurrentSong = true
          }
          return false
        }
      })
    }
    let indexOfNextSong = takeAPass()
    if(indexOfNextSong === -1) { //there was no song on the list after the current song
      indexOfNextSong = takeAPass() //look from the beginning, but start with seenCurrentSong = true
    }
    if(indexOfNextSong === -1) { //there was no song on the list after the current song
      throw 'current song not found on song list'
    }
    return sortedSongList[indexOfNextSong]

  }
  getFilteredSonglist () {
    return(this.songlist.filter((song) => Model.songMatchesFilter(song, this.filter)))
  }

  static songMatchesFilter (song, filter) {
    //always filter songs that don't have loaded data
    if(!song.data) {
      return false
    }
    let ands = filter.toUpperCase().split(/\s/)
    return ands.every((filter) => {
      return Object.keys(song).some((field) => {
        return field !== 'file' && Model.isString(song[field]) && song[field].toUpperCase().includes(filter)
      })
    })
  }

  static isString (v) {
    return typeof v === 'string' || v instanceof String
  }
}

export default Model
