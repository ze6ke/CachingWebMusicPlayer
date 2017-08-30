//initialize project
//integrate with mocha (or something)
//confirm the app loads
//change song
//get used space
//clear store and confirm used space
//filter songs
//pause/restart music
//
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
