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
      window.URL.revokeObjectURL(this.URL)
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
