import Song from './song.model.js'
import {throttle} from '../utils/util.js'

class Songlist {
  constructor(renderApp, storageStrategy, fetchStrategy, fake=false) {
    this.songlist = null
    this.filter = ''
    this.current = null
    this.renderApp = () => {
      renderApp(this)
    }
    this.fake = fake
    this.storageStrategy = storageStrategy
    this.fetchStrategy = fetchStrategy
  }

  clearCachedData() {
    this.storageStrategy.clearData()
      .then(() => {
        alert('Data Cleared')
      })
  }

  resetCachedData() {
    this.storageStrategy.reset()
      .then(() => {
        alert('Cache Reset')
      })
  }

  showDataUsage() {
    this.storageStrategy.getDataUsage()
      .then((usage) => {
        alert(this.storageStrategy.name + ': ' + usage.toFixed(2) + 'MB')
      })
  }


  fetchAllSongs() {
    let maxSize = Infinity
    let generateTicket = throttle.promiseTicketGenerator(2)
    this.songlist.forEach((song)=> {
      let ticket = generateTicket()
      let theSong = null
      ticket.resolve(song)
        .then((song) => {
          theSong = song
          if(song.size < maxSize) { //don't bother fetching the song if it can't be stored
            return song.fetchData()
          } else {
            return null
          }
        })
        .catch((e) => {
          if(e.message.indexOf('too large') !== -1 || e.name == 'QuotaExceededError') {
            maxSize = theSong.size
          }
          return null
        })
        .then(ticket.returnOnSuccess, ticket.returnOnError)
        .then((song) => {
          if(!this.current && song) {
            this.changeCurrentSong(song)
          }
          this.renderApp()
        })
    })
  }

  setSonglist (songlist) {
    this.songlist = songlist.map((raw) => new Song(raw, this.storageStrategy, this.fetchStrategy, this.fake))
    this.fetchAllSongs()
  }


  changeCurrentSong (song) {
    if(!!song && (!(song.constructor) /*|| song.constructor.name !== 'Song'*/)) {//minification changes the constructer name and breaks this
      throw {name: 'incorrect type', message: 'Songlist.changeCurrentSong can only accept a Song'}
    }
    this.current && this.current.reset()

    this.current = song

    if(this.current && !this.fake) {
      return song.prepare()
    } else {
      return Promise.resolve()
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
    //let seenCurrentSong = false
    const current = this.current
    //const filter = this.filter

    return Promise.all(this.songlist.map((song) => song.matchesFilter(this.filter)))
      .then((boolArray) => {
        const currentPos = sortedSongList.indexOf(current)
        let nextPos = currentPos === boolArray.length - 1 ? -1 : boolArray.indexOf(true, currentPos + 1)
        if(nextPos == -1) {
          nextPos = boolArray.indexOf(true)
        }
        return nextPos === -1 ? undefined : sortedSongList[nextPos]
      })
  }

  getFilteredSonglist () {
    return Promise.all(this.songlist.map((song) => song.matchesFilter(this.filter)))
      .then((boolArray) => {
        return this.songlist.filter((song, i) => boolArray[i])
      })
  }

}

export default Songlist
