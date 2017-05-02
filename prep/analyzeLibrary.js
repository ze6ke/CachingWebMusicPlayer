const ffmetadata = require('ffmetadata')
//const fs = require('fs')
const path = require('path')
const walk = require('walk')

const startingPath = process.argv[2] ? process.argv[2] : '.'

//console.log(startingPath)

let walker = walk.walk(startingPath, {followLinks: false})
let fileList = []
walker.on('file', (root, filestats, next) => {
  const fullPath = path.join(root, filestats.name)
  readMetaData(fullPath).then((metadata)=>{
    //fileList.push(Object.assign({},filestats, metadata, {fullPath}))
    fileList.push({filestats, metadata, fullPath})
    //console.log(path.join(root, filestats.name))
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


walker.on('end', () => {
  let library = keepGoodFields(keepGoodFiles(fileList))
  console.log(prettify(library))
})

walker.on('error', console.log)
function fixFilePath(path) {
  return path.substring(15)
}
function prettify(arr) {
  return '[\n' + arr.map((el) => JSON.stringify(el)).join(',\n') + '\n]'
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

/*let fileList = []

function handleUnknownType()

function handleFile(file)

function handleDirectory(filepath) {
  fs.readdir(filepath, (err, files) => {
    files.map((file) => {
      determineType(path.join(filepath, file), handleDirectory, handleFile)
    })
  })
}

function determineType(file, cbForDirectory, cbForFile) {
  fs.stat(file, (err, stats) => {
    if(stats.isDirectory()) {
      cbForDirectory(file)
    } else {
      cbForFile(file)
    }
  })
}

https://git.daplie.com/Daplie/node-walk

function processFolder(fileList, filepath) {

}

fs.readdir('.', (err, files) => {
  files.map((file)=>{
    fs.stat(file, (err, stats) => {
      //console.log(JSON.stringify(stats))
      console.log(stats.isDirectory())
    })
  })
})
*/

module.exports = {keepGoodFields,keepGoodFiles, fixFilePath}
