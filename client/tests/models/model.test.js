/*global describe, it, before */
import Model from '../../app/models/model.js'
import {expect} from 'chai'
import util from '../../app/utils/util.js'
import Song from '../../app/models/song.model.js'
import storageStrategy from '../../app/utils/storageStrategy.js'
import fetchStrategy from '../../app/utils/fetchStrategy.js'
//import {isPhantom} from '../helper.js'


//const Model = require('../../app/models/model.js')
//const expect = require('chai').expect

describe('util.isString', function() {
  it('identifies strings correctly', function() {
    expect(util.isString).to.not.be.undefined
    expect(util.isString('hi')).to.equal(true)
    expect(util.isString(5)).to.equal(false)
  })
})

describe('util.formatError', function() {
  it('handles strings', function() {
    expect(util.formatError('hi', undefined, '\n')).to.equal('hi')
  })

  it('handles name, message objects', function() {
    expect(util.formatError({name:'name', message: 'message'}, undefined, '\n')).to.equal(
      'name: name\nmessage: message')
  })

  it('handles weird objects', function() {
    expect(util.formatError({f: 1, f1: 2}, null, '\n')).to.equal('f,f1')
  })
})

describe('util.Base64Strings', function() {
  const type = 'audio/mpeg'
  //const smallBlob = new Blob(['this will be encoded'], {type})
  const sourceSmallArray = new Uint8Array([1,2,3,4,5])
  let sourceBigArray = new Uint8Array([...Array(5000)].map(()=>5))
  sourceBigArray[1] = 200
  const smallBlob = new Blob([sourceSmallArray], {type})
  const bigBlob = new Blob([sourceBigArray], {type})
  const base64String = 'AQIDBAU='

  it('blobToBase64Strings returns a promise', function() {
    expect(util.blobToBase64Strings(smallBlob, 'base')).to.be.a('promise')
  })

  it('blobToBase64Strings has the right values', function() {
    let retval = util.blobToBase64Strings(smallBlob, 'base')
    return retval.then((x) => {
      expect(x[1].base64String).to.equal(base64String)
    })
  })

  it('base64StringsToBlob returns a blob', function() {
    const theBlob = util.base64StringsToBlob([base64String], type)
    expect(theBlob).to.be.a('blob')
  })

  it('base64StringsToBlob has the right values', function() {
    const theBlob = util.base64StringsToBlob([base64String], type)
    expect(theBlob.size).to.be.equal(smallBlob.size)
    return util.blobToArray(theBlob).then((ar)=> {
      const uint8 = new Uint8Array(ar)
      expect(uint8[0]).to.equal(sourceSmallArray[0])
      expect(uint8[1]).to.equal(sourceSmallArray[1])
    })
  })


  it('can convert from string to blob and back', function() {
    const theBlob = util.base64StringsToBlob([base64String], type)

    let theNewString = util.blobToBase64Strings(theBlob, 'base')
    return theNewString.then((x)=>{
      expect(x[1].base64String).to.equal(base64String)
    })
  })

  it('can convert from blob to string and back on big datasets', function() {
    return util.blobToBase64Strings(bigBlob, 'base', 100).then((asStrings) => {
      let justTheStrings = []
      for(let i=1;i<asStrings.length;i++) {
        justTheStrings.push(asStrings[i].base64String)
      }
      const theBlob = util.base64StringsToBlob(justTheStrings, asStrings[0].type)
      expect(theBlob.size).to.equal(bigBlob.size)
      expect(theBlob.type).to.equal(bigBlob.type)
      return util.blobToArray(theBlob)
    }).then((ar)=> {
      const uint8 = new Uint8Array(ar)
      expect(uint8[0]).to.equal(sourceBigArray[0])
      expect(uint8[1]).to.equal(sourceBigArray[1])
    })
  })
})

const songlistRaw = [
  {title: 'this is a name', file: '1.mpg'},
  {title: 'this is a name', genre: 'a genre', file: '2.mpg'},
  {title: 'song 3', genre: 'genre', file: '3.mpg'}
]

describe('song', function() {
  let songlist
  before(function() {
    songlist = songlistRaw.map((raw) => new Song(raw, storageStrategy.volatile, fetchStrategy.none, true))
  })

  it('Filters correctly on 1x1', function() {
    const singleItemSong = songlist[0]
    const validCriterion1 = 'name'
    const invalidCriterion1 = 'names'

    return singleItemSong.matchesFilter(validCriterion1)
    .then((result) => {
      expect(result).to.equal(true)
      return singleItemSong.matchesFilter(invalidCriterion1)
    })
    .then((result) => {
      expect(result).to.equal(false)
    })
  })

  it('Filters correctly on 2x1', function() {
    const multiItemSong1 = songlist[1]
    const multiItemSong2 = songlist[2]
    const criterion1 = 'name'
    const validCriterion2 = 'genre'
    const invalidCriterion1 = 'names'

    return multiItemSong1.matchesFilter(criterion1)
    .then((result) => {
      expect(result).to.equal(true)
      return multiItemSong1.matchesFilter(validCriterion2)
    })
    .then((result) => {
      expect(result).to.equal(true)
      return multiItemSong1.matchesFilter(invalidCriterion1)
    })
    .then((result) => {
      expect(result).to.equal(false)
      return multiItemSong2.matchesFilter(criterion1)
    })
    .then((result) => {
      expect(result).to.equal(false)
    })
  })

  it('Filters correctly on 2x2', function() {
    const multiItemSong = songlist[1]
    const validCriterion1 = 'name genre'
    const invalidCriterion1 = 'names genre'

    return multiItemSong.matchesFilter(validCriterion1)
    .then((result) => {
      expect(result).to.equal(true)
      return multiItemSong.matchesFilter(invalidCriterion1)
    })
    .then((result) => {
      expect(result).to.equal(false)
    })
  })

  it('Filters correctly on empty filter', function() {
    const multiItemSong = songlist[1]
    const validCriterion1 = ''

    return multiItemSong.matchesFilter(validCriterion1)
    .then((result) => {
      expect(result).to.equal(true)
    })
  })

  const type = 'audio/mpeg'
  const mediumArray = new ArrayBuffer(5000)
  const bigArray = new ArrayBuffer(5000000)

  let testDataStorage = (aSong, arr) => {
    return aSong.storeData(arr)
    .then(() => {return aSong.prepare()})//passing aSong.prepare directly causes this to not be bound. :(
    .then(()=>{
      expect(aSong.tempData).to.not.be.undefined
      expect(aSong.tempData.size).to.equal(arr.byteLength)
    })
  }

  let testStorageStrategy = (strategyName) => {
    describe(strategyName, () => {
      let ss
      let aSong

      before(() => {
        return storageStrategy.resetStrategy(strategyName)
        .then(() => {
          return storageStrategy.getStrategy(strategyName)
        })
        .then((theStrategy) => {
          ss = theStrategy
          aSong = new Song(songlistRaw[0], ss, fetchStrategy.none, true)
          return ss.getConfig()
        })
      })

      it('stores data 50 KB of data correctly', function(){return testDataStorage(aSong, mediumArray)})
      it('stores data 5 MB of data correctly', function(){return testDataStorage(aSong, bigArray)})

      if(strategyName !== 'volatile') {
        it('tracks used space', function () {
          return ss.getDataUsage()
          .then((spaceUsed) => {
            expect(spaceUsed).to.be.above(0)
          })
        })
        it('clears used space', function () {
          return ss.clearData()
          .then(() => {
            return ss.getDataUsage()
          })
          .then((spaceUsed) => {
            expect(spaceUsed).to.be.equal(0)
          })
        })
      }
    })
  }

  testStorageStrategy('indexedDB')
  testStorageStrategy('volatile')

})

describe('model', function() {
  const songlist = songlistRaw

  it('getFilteredSonglist works correctly with empty filter', function() {
    var model = new Model((f)=>f, storageStrategy.volatile, fetchStrategy.none, true)
    model.setSonglist(songlist, true)
    return model.getFilteredSonglist()
    .then((filteredList) => {
      expect(filteredList).to.have.lengthOf(3)
    })

  })

  it('getFilteredSonglist works correctly with a filter', function() {
    var model = new Model((f)=>f, storageStrategy.volatile, fetchStrategy.none, true)
    model.setSonglist(songlist, true)
    model.changeFilter('s')
    return model.getFilteredSonglist()
    .then((filteredList) => {
      expect(filteredList).to.have.lengthOf(3)
      model.changeFilter('genre')
    })
    .then(()=>model.getFilteredSonglist())
    .then((filteredList) => {
      expect(filteredList).to.have.lengthOf(2)
      model.changeFilter('name genre')
    })
    .then(()=>model.getFilteredSonglist())
    .then((filteredList) => {
      expect(filteredList).to.have.lengthOf(1)
    })
  })

  it('getNextSong works correctly with unfiltered list', function() {
    var model = new Model((f)=>f, storageStrategy.volatile, fetchStrategy.none, true)
    model.setSonglist(songlist, true)
    return model.changeCurrentSong(model.songlist[0])
    .then(() => {
      return model.getNextSong()
    })
    .then((aSong) => {
      return model.changeCurrentSong(aSong)
    }).then(() => {
      expect(model.getCurrentSong().file).to.deep.equal(songlist[1].file)
      return model.getNextSong()
    })
    .then((aSong) => {
      return model.changeCurrentSong(aSong)
    }).then(() => {
      expect(model.getCurrentSong().file).to.deep.equal(songlist[2].file)
      return model.getNextSong()
    })
    .then((aSong) => {
      return model.changeCurrentSong(aSong)
    }).then(() => {
      expect(model.getCurrentSong().file).to.deep.equal(songlist[0].file)
    })
  })

  it('getNextSong works correctly with filtered list', function() {
    var model = new Model((f)=>f, storageStrategy.volatile, fetchStrategy.none, true)
    model.setSonglist(songlist, true)
    return model.changeCurrentSong(model.songlist[0])
    .then(() => {
      model.changeFilter('song')
      return model.getNextSong()
    })
    .then((aSong) => {
      return model.changeCurrentSong(aSong)
    })
    .then(() => {
      expect(model.getCurrentSong().file).to.deep.equal(songlist[2].file)
      return model.getNextSong()
    })
    .then((aSong) => {
      return model.changeCurrentSong(aSong)
    })
    .then(() => {
      expect(model.getCurrentSong().file).to.deep.equal(songlist[2].file)
      model.changeFilter('genre')
      return model.getNextSong()
    })
    .then((aSong) => {
      return model.changeCurrentSong(aSong)
    })
    .then(() => {
      expect(model.getCurrentSong().file).to.deep.equal(songlist[1].file)
    })
  })
})
