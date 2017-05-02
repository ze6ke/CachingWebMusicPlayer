const ffmetadata = require('ffmetadata')
const fs = require('fs')
const path = require('path')
const walk = require('walk')

const startingPath = process.argv[2] ? process.argv[2] : 'music' //music should be maintained as a soft link in this
//folder and point to the correct target

let walker = walk.walk(startingPath, {followLinks: false})
let fileList = []
walker.on('file', (root, filestats, next) => {
  const fullPath = path.join(root, filestats.name)
  readMetaData(fullPath).then((metadata)=>{
    fileList.push({filestats, metadata, fullPath})
    next()
  })
})
function keepGoodFiles (fileList) {
  return fileList.filter((file) =>
    file.metadata && Object.keys(file.metadata).length>=2)
}
function keepGoodFields (fileList) {
  return fileList.map((file) => {
    let retval = ['artist', 'genre', 'title', 'album'].filter((field) => file.metadata[field])
    .reduce((obj, field) => Object.assign(obj, {[field]: file.metadata[field]}), {})
    retval.file = fixFilePath(file.fullPath)
    return retval
  })
}

function writeFiles(library) {
  fs.writeFile('shortLibrary.json', prettify(library.slice(0, 10)))
  fs.writeFile('library.json', prettify(library))
  fs.writeFile('shortManifest', prepFileListForManifest(library.slice(0,10)))
  fs.writeFile('manifest', prepFileListForManifest(library))
}


walker.on('end', () => {
  let library = keepGoodFields(keepGoodFiles(fileList))
  //console.log(prettify(library))
  writeFiles(library)
})

walker.on('error', console.log)
function fixFilePath(path) {
  return path.substring(6)
}
function prettify(arr) {
  return '[\n' + arr.map((el) => JSON.stringify(el)).join(',\n') + '\n]'
}
function prepFileListForManifest(fileList) {
  return fileList.reduce((retval, file) => {
    return retval + '\n' + prepFileForManifest(file)
  }, '')
}
function prepFileForManifest(file) {
  return encodeURI('data/' + file.file)
}

function readMetaData(filepath) {
  return new Promise((resolve) => {
    ffmetadata.read(filepath, (err, data) => {
      if (err) {
/*        console.error('Error reading metadata, possibly sudo apt-get install ffmetadata will fix it')
        console.error(err)
        reject(err)*/
        resolve({error:'metadata could not be retrieved'})
      }
      else {
        resolve(data)
      }
    })
  })
}



module.exports = {keepGoodFields,keepGoodFiles, fixFilePath}
