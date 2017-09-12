/* globals it, describe, before, afterEach, after, beforeEach */
//x-confirm the app loads
//x-song count is right
// change song
//x-get used space
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
const repeatUntilValid = require('./repeatUntilValid.js')

const By = webdriver.By
const until = webdriver.until
let driver 

describe('the app', function() {
  this.timeout(30000)

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

    beforeEach(function() {
      return driver.wait(until.elementLocated(By.css('span.song-count'))) //make sure that the app has rendered
    })

    it('has a title', function() {
      return driver.getTitle()
        .then((title) => {
          expect(title).to.equal('Music Player')
        })
    })

    it('loads 20 songs', function() {
      return driver.wait(until.elementTextIs(driver.findElement(By.css('span.song-count')), '20'))
    })

    it('show space usage', function() {
      return driver.findElement(By.css('label[for=hamburger-check]'))
        .click()
        .then(()=>driver.wait(until.elementIsVisible(driver.findElement(By.css('ul.menu li')))))
        .then(()=>{
          return driver.findElements(By.css('ul.menu li'))
            .then((elements)=>{
              elements[1].click() //I could also look at the text to filter this, but neither option's perfect
            })
        })
        .then(()=>repeatUntilValid(()=>driver.switchTo().alert(), 500, 20000))
        //.then(()=>sleep(3000))//I couldn't figure out how to actually wait without writing a new version of wait.
        .then(()=>driver.switchTo().alert().getText())
        .then((text)=>{
          expect(text).to.match(/^.+: [\d.]+MB$/)
        })
    })

  })
})

