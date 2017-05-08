import Song from './song.model.js'

class Songlist {
  constructor(renderApp) {
    this.songlist = null
    this.filter = ''
    this.current = null
    this.renderApp = function () {renderApp(this)}
  }

  clearCachedData() {
    alert('clearCachedData called')
  }

  showDataUsage() {
    alert('showDataUsage called')
  }


  fetchAllSongs() {
    this.songlist.forEach((song)=>song.fetchData(()=>{this.renderApp()}))
    //this.fetchSong(this.songlist[0], () => {  })
  }

  setSonglist (songlist) {
    this.songlist = songlist.map((raw) => new Song(raw))
    //this.changeCurrentSong(songlist[0])
    this.fetchAllSongs()
  }


  changeCurrentSong (song) {
    this.current && this.current.resetSong()

    this.current = song

    song.prepare()
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
