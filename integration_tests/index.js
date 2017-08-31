/* globals it, describe, before */
//x-confirm the app loads
//change song
//get used space
//clear store and confirm used space
//filter songs
//pause/restart music
//
/*
require('chromedriver')


const webdriver = require('selenium-webdriver')
const By = webdriver.By
const until = webdriver.until
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build()

driver.get('http://www.google.com/ncr')
driver.findElement(By.name('q')).sendKeys('webdriver')
driver.findElement(By.css('input[value="Google Search"]')).click()
driver.wait(until.titleIs('webdriver - Google Search'), 1000)
driver.quit()
*/

let {expect} = require('chai')
require('chromedriver')

const webdriver = require('selenium-webdriver')
//const By = webdriver.By
//const until = webdriver.until
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build()

describe('the app', function() {
  this.timeout(60000)

  before(function() {
    return driver.get('http://localhost:8000/')
  })

  it('has a title', function() {
    
    return driver.getTitle()
      .then((title) => {
        expect(title).to.not.have.lengthOf(0)
      })
  })

})
