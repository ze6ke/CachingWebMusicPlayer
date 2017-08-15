/*global describe, it*/
let {expect} = require('chai')
import util from '../../app/utils/util.js'

describe('util', function() {

  describe('throttle', function() {
    describe('basic', function() {
      it('calls a single function without args', function(cb) {
        const f = () => cb()
        const throttledf = util.throttle.basic(f, 10)
        throttledf()
      })
      it('handles multiple calls correctly', function(cb) {
        let callcount = 0
        const f = (end) => {
          callcount++
          if(end) {
            expect(callcount).to.equal(2) //the first call should happen and the last call should happen, but no intermediate calls should happen
            cb()
          }
        }
        const throttledf = util.throttle.basic(f, 250)
        for(let i = 0; i < 20; i++ )
        {
          throttledf(false)
        }
        throttledf(true)
      })
    })
    describe('promisePerSeconds', function() {
      it('releases a single promise', function() {
        let resolver = util.throttle.promisePerSecondGenerator(100)
        const thePromise = resolver()
        expect(thePromise).to.be.a('Promise')
        return thePromise
      })
      it('releases promises in the right order', function() {
        let resolve = util.throttle.promisePerSecondGenerator(100)
        let aggregator = ''
        return Promise.all([
          resolve().then(()=>{aggregator += '1'}),
          resolve().then(()=>{aggregator += '2'}),
          resolve().then(()=>{aggregator += '3'})])
          .then(()=>{expect(aggregator).to.equal('123')})
      })
      it('passes values correctly', function() {
        let resolve = util.throttle.promisePerSecondGenerator(100)
        return resolve(5).then((val)=>{expect(val).to.equal(5)})
      })
      it('releases promises at the right speed', function() {
        let resolve = util.throttle.promisePerSecondGenerator(5)
        let startTime  
        return Promise.all([
          resolve().then(() => {
            startTime = +new Date()
          }),
          resolve().then(() => {
            const now = +new Date()
            expect(now - startTime).to.be.within(150, 250)
          })
        ])
      })
    })
    describe('promiseTicketGenerator', function() {
      it('releases the first promise', function() {
        let ticketGenerator = util.throttle.promiseTicketGenerator(1)
        let theTicket = ticketGenerator()
        return theTicket.resolve()
          .then(theTicket.returnOnSuccess, theTicket.returnOnError)
      })
      it('passes arguments', function() {
        let ticketGenerator = util.throttle.promiseTicketGenerator(1)
        let theTicket = ticketGenerator()
        return theTicket.resolve(5)
          .then((val) => {
            expect(val).to.equal(5)
          })
          .then(theTicket.returnOnSuccess, theTicket.returnOnError)
      })
      it('does not release all the promises at once', function(cb) {
        let ticketGenerator = util.throttle.promiseTicketGenerator(1)
        let theTicket = ticketGenerator()
        let theSecondTicket = ticketGenerator()
        let aggregator = ''
        //let theFirstPromise = null
        let theSecondPromise = null

        /*theFirstPromise = */theTicket.resolve()
          .then(() => {
            theSecondPromise = theSecondTicket.resolve() //if everything is working correctly, this won't resolve until the first ticket has returned
              .then(() => {
                aggregator += '2'
              })
              .then(theSecondTicket.returnOnSuccess, theSecondTicket.returnOnError)

            expect(aggregator).to.equal('')
          })

        setTimeout(() => { //wait for a while before releasing the first ticket.  If the second promise was gonna do it's thing, it would
          expect(aggregator).to.equal('')
          theTicket.returnTicket()
          theSecondPromise.then(cb)
        }, 200)
      })
    })
  })

  describe('isString', function() {
    it('identifies strings correctly', function() {
      expect(util.isString).to.not.be.undefined
      expect(util.isString('hi')).to.equal(true)
      expect(util.isString(5)).to.equal(false)
    })
  })

  describe('formatError', function() {
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

  describe('Base64Strings', function() {
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
})
