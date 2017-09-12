
const screenShotPath = 'integration_tests/screenshots'

const fs = require('fs-extra')

fs.ensureDirSync(screenShotPath)
fs.emptyDirSync(screenShotPath)


function writeScreenshotIfNeeded(test, driver) {
  if(test.currentTest.state==='failed') {
    const title = test.currentTest.title
    const targetPath = `${screenShotPath}/${title}.png`

    console.log(`writing screenshot to: ${targetPath}`)

    return writeScreenshot(targetPath, driver)
  } else {
    return Promise.resolve()
  }
}

function writeScreenshot(filename, driver) {
  return driver.takeScreenshot()
    .then( (image, err) => {
      return fs.writeFile(filename, image, 'base64')
    })
    .catch( (err) => {
      err && console.log(err)
    })
}

module.exports = writeScreenshotIfNeeded
