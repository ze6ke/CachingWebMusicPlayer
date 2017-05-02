/*global describe, it */
const expect = require('chai').expect
const analyzeLibrary = require('../analyzeLibrary.js')

describe('analyzeLibrary', function() {
  const fileList = [
    {removeMe: 'value', Me2: 'value', metadata: {genre:'Electronica/Dance',title:'In the Club vs Closer'},fullPath:'1234567890123456/closer'},
    {metadata: {artist:'Alain Souchon',genre:'Pop',title:'Sous Les Jupes Des Filles',album:'Collection'},fullPath:'1234567890123456/jupes'},
    {metadata: {error:'coulnt find metadata'},fullPath:'1234567890123456/badfile'}
  ]

  const goodFileList = [fileList[0], fileList[1]]
  const goodFieldsOnGoodFiles = [
    {genre:'Electronica/Dance',title:'In the Club vs Closer',file:'6/closer'},
    {artist:'Alain Souchon',genre:'Pop',title:'Sous Les Jupes Des Filles',album:'Collection', file:'6/jupes'},
  ]

  it('fixesFilePath as expect', function() {
    expect(analyzeLibrary.fixFilePath(goodFileList[0].fullPath)).to.deep.equal(goodFieldsOnGoodFiles[0].file)
  })

  it('keepsGoodFiles', function() {
    expect(analyzeLibrary.keepGoodFiles(fileList)).to.deep.equal(goodFileList)
  })

  it('keepsGoodFields', function() {
    expect(analyzeLibrary.keepGoodFields(goodFileList)).to.deep.equal(goodFieldsOnGoodFiles)
  })
})
