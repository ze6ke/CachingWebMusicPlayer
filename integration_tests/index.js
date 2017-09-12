/* globals it, describe, before, afterEach, after */
//x-confirm the app loads
//x-song count is right
// change song
// get used space
// clear store and confirm used space
// filter songs
// pause/restart music
//
// loads songs
// can select song
// can forward songs
// shows disk usage
//
//

require('chromedriver')
const {expect} = require('chai')

const webdriver = require('selenium-webdriver')
const writeScreenshotIfNeeded = require('./writeScreenshotIfNeeded')

const By = webdriver.By
const until = webdriver.until
let driver 

describe('the app', function() {
  this.timeout(60000)

  before(function() {
    driver = new webdriver.Builder()
      .forBrowser('chrome')
      .build()
  })
    
  after(function() {
    return driver.quit()
  })

  afterEach(function() {
    return writeScreenshotIfNeeded(this, driver)
  }) 


  describe('suite 1', function() {

    before(function() {
      return driver.get('http://localhost:8000/')
    })

    it('has a title', function() {
      return driver.getTitle()
        .then((title) => {
          expect(title).to.equal('Music Player')
        })
    })

    it('loads 20 songs', function() {
      return driver.wait(until.elementLocated(By.css('span.song-count')))
        /*.then(()=> {
          return driver.findElement(By.css('span.song-count')).getText()
        })
        .then((text)=>{
          console.log(text)
        }) */
        .then(() => driver.wait(until.elementTextIs(driver.findElement(By.css('span.song-count')), '20')))
    })

  })
})


