import Song from './song.model.js'

class Songlist {
  constructor(renderApp, fake=false) {
    this.songlist = null
    this.filter = ''
    this.current = null
    this.renderApp = () => {
      renderApp(this)
    }
    this.fake = fake
  }

  clearCachedData() {
    localStorage.clear()
    sessionStorage.clear()
    alert('clearCachedData called')
  }

  getLocalStorageUsage() {
    return Object.keys(localStorage).reduce((acc, val) => {
      return acc += localStorage.getItem(val).length * 2
    }, 0)/1024/1024
  }
  showDataUsage() {
    alert('localStorage: ' + this.getLocalStorageUsage().toFixed(2) + 'MB')
  }


  fetchAllSongs() {
    //this.songlist.forEach((song)=>song.fetchData(()=>{this.renderApp()}))
    this.songlist.forEach((song)=>song.fetchData().then(this.renderApp))
  }

  setSonglist (songlist) {
    this.songlist = songlist.map((raw) => new Song(raw, this.fake))
    this.changeCurrentSong(this.songlist[0])
    this.fetchAllSongs()
  }


  changeCurrentSong (song) {
    this.current && this.current.reset()

    this.current = song

    if(!this.fake) {
      return song.prepare()
    } else {
      return undefined
    }
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
          return thisSong.matchesFilter(filter)
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
    return(this.songlist.filter((song) => song.matchesFilter(this.filter)))
  }

}

export default Songlist
