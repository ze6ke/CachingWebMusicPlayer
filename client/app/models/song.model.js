import {isString} from '../utils/util.js'
import 'babel-polyfill'


class Song {
  constructor(raw, storageStrategy, fetchStrategy, isReady=false)
  {
    this.artist = raw.artist
    this.genre = raw.genre
    this.title = raw.title
    this.album = raw.album
    this.file = raw.file
    this.storageStrategy = storageStrategy
    this.fetchStrategy = fetchStrategy
    this.isReady = isReady
    if(isReady) {
      this.isReadyPromise = Promise.resolve()
    } else {
      this.isReadyPromise = this.hasData().then((hasData) => this.isReady = !!hasData)
    }
  }

  hasData() {
    if(this.isReady){
      return Promise.resolve(true)
    }
    return this.storageStrategy.hasData(this)
  }

  storeData(data) {
    return this.storageStrategy.storeData(this, data)
    .then(() => this.isReady = true)
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
    .then(null, (err)=> {
      return null
    })
  }

  fetchData() {
    return this.isReadyPromise.then(() => {
      if(this.isReady) {
        return Promise.resolve(this)
      }
      return this.fetchStrategy.fetch('data/' + this.file)
      .then((data) => {
        return this.storeData(data)
      })
      .then(() => this)
    })
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
