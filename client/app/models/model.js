

class Model {
  constructor() {
    this.songlist = null
    this.filter = ''
    this.current = null
  }

  setSonglist (songlist) {
    this.songlist = songlist
  }
  changeCurrentSong (song) {
    this.current = song
  }
  changeFilter (filter) {
    this.filter = filter
  }
  getNextSong () {

  }
  getFilteredSonglist () {
    return(this.songlist.filter((song) => Model.songMatchesFilter(song, this.filter)))
  }

  static songMatchesFilter (song, filter) {
    let ands = filter.toUpperCase().split(/\s/)
    return ands.every((filter) => {
      return Object.keys(song).some((field) => {
        return Model.isString(song[field]) && song[field].toUpperCase().includes(filter)
      })
    })
  }

  static isString (v) {
    return typeof v === 'string' || v instanceof String
  }
}

export default Model
