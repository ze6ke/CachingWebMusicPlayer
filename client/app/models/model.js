
class Model {
  constructor() {
    this.songlist = null
    this.filter = ''
    this.current = null
  }

  setSonglist (songlist) {
    this.songlist = songlist
    this.changeCurrentSong(songlist[0])
  }
  changeCurrentSong (song) {
    this.current = song
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
