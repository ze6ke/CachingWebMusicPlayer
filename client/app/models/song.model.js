import {displayError, isString} from '../utils/util.js'
import 'babel-polyfill'


class Song {
  constructor(raw, storageStrategy, fetchStrategy, confirmedReady=false)
  {
    this.artist = raw.artist
    this.genre = raw.genre
    this.title = raw.title
    this.album = raw.album
    this.file = raw.file
    this.storageStrategy = storageStrategy
    this.fetchStrategy = fetchStrategy
    this.confirmedReady = confirmedReady
    this.type = 'audio/mpeg'
  }

  hasData() {
    if(this.confirmedReady){
      return Promise.resolve(true)
    }
    return this.storageStrategy.hasData(this).then((hasData) => {
      this.confirmedReady = hasData //capture the result so we only call it once
      return hasData
    })
  }

  storeData(data) {
    return this.storageStrategy.storeData(this, data)
    .then(() => this.confirmedReady = true)
  }

  reset() {
    if(this.URL) {
      window.URL.revokeObjectURL(this.URL) //Object URLs need to be reclaimed.  To avoid loading the entire library into volatile memory, I reset songs after finishing with them.
      delete this.URL
    }
    if(this.tempData) {
      delete this.tempData
    }
  }

  prepare() {
    return this.storageStrategy.prepare(this)
  }

  fetchData() {
    return this.hasData()
    .then((hasData) => {
      if(hasData) {
        return this
      } else {
        return this.fetchStrategy.fetch('data/' + this.file)
        .then((data) => {
          return this.storeData(data)
        })
        .then(() => this)
      }
    })
  }


  matchesFilter (filter) {
    //always filter songs that don't have loaded data
    return this.hasData()
    .then((hasData) => {
      if(!hasData) {
        return false
      } else {
        //break the filter into tokens on whitespace (e.g., 'one two' becomes two tokens, 'one' and 'two')
        //Afterwards confirm that each token matches to at least one field on this song (e.g., token one could match to title and token two 
        //match to album).  If any token can't be matched to a field, the song is filtered, otherwise the song is displayed.
        let ands = filter.toUpperCase().split(/\s+/)
        return ands.every((filter) => {
          return Object.keys(this).some((field) => {
            return field !== 'file' && isString(this[field]) && this[field].toUpperCase().includes(filter)
          })
        })
      }
    })
  }
}

export default Song
