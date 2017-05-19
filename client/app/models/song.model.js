import {isString} from '../utils/util.js'
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
    /*if(isReady) {
      this.isReadyPromise = Promise.resolve()
    } else {
      this.isReadyPromise = this.hasData().then((hasData) => this.isReady = !!hasData)
    }*/
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
    /*.then(null, (err)=> {
      return null
    })*/
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

    /*return this.isReadyPromise.then(() => {
      if(this.isReady) {
        return Promise.resolve(this)
      }
      return this.fetchStrategy.fetch('data/' + this.file)
      .then((data) => {
        return this.storeData(data)
      })
      .then(() => this)
    })*/
  }


  matchesFilter (filter) {
    //always filter songs that don't have loaded data
    return this.hasData()
    .then((hasData) => {
      if(!hasData) {
        return false
      } else {
        let ands = filter.toUpperCase().split(/\s/)
        return ands.every((filter) => {
          return Object.keys(this).some((field) => {
            return field !== 'file' && isString(this[field]) && this[field].toUpperCase().includes(filter)
          })
        })
      }
    })
    /*if(!this.isReady) {
      return false
    }
    let ands = filter.toUpperCase().split(/\s/)
    return ands.every((filter) => {
      return Object.keys(this).some((field) => {
        return field !== 'file' && isString(this[field]) && this[field].toUpperCase().includes(filter)
      })
    })*/
  }
}

export default Song
