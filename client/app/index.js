//import Inferno from 'inferno'
//let render = Inferno.render
import React from 'react'
import {render} from 'react-dom'
import storageStrategy from './utils/storageStrategy.js'
import fetchStrategy from './utils/fetchStrategy.js'

import App from './views/app.js'
import Model from './models/songlist.model.js'
import functionalityTest from './functionalityTest.js'
import {isMobile, throttle, displayError} from './utils/util.js'

const libraryPath = 'library.json'

window.React = React
let header = null
let headerPlaceholder = null

if(navigator && isMobile(navigator.userAgent)) {
  window.onerror = function (errorMsg, url, lineNumber) {
    displayError(errorMsg, 'window.onerror')
    return true //allow normal error handling to continue
  }
}

const setHeaderPlaceholderHeight = throttle.basic(() => {
  headerPlaceholder.style.height = header.getBoundingClientRect().height + 'px'
}, 80)


functionalityTest()

let model
const getLibrary = () => {
  return fetch(libraryPath)
    .then((response) => {
      if(response.ok) {
        return response.json()
      } else {
        throw {name:response.statusText, message: 'none'}
      }
    })
}

const changeCurrentSong = (song) => {
  model.changeCurrentSong(song).then(()=>renderApp(model))
}

const changeFilter = (e) => {
  model.changeFilter(e.target.value)
  renderApp(model)
}

const songEnded = () => {
  model.getNextSong()
    .then((song) => changeCurrentSong(song))
}

const clearCachedData = () => {
  return model.clearCachedData()
}

const resetCachedData = () => {
  return model.resetCachedData()
}

const showDataUsage = () => {
  return model.showDataUsage()
}

const grabHeader = (e) => {
  header = e
}

const grabHeaderPlaceholder = (e) => {
  headerPlaceholder = e
}

const callbacks = {changeCurrentSong, songEnded, changeFilter, grabHeaderPlaceholder,
  grabHeader, clearCachedData, showDataUsage, resetCachedData}

function renderApp (model) {
  return model.getFilteredSonglist()
    .then((songs) => {
      
      render(<App songs={songs} current={model.getCurrentSong()} callbacks={callbacks}/>,
        document.getElementById('app-container'))
    })

}

storageStrategy.getStrategy('indexedDB').then((ss) => {
  model = new Model(throttle.basic(renderApp, 1000), ss, fetchStrategy.XHR)
  Promise.all([
    getLibrary(),
    ss.getConfig()])
    .then((data) => {
      model.setSonglist(data[0])
      renderApp(model)
        .then(() => {
          setHeaderPlaceholderHeight()
        })
      window.onresize = setHeaderPlaceholderHeight
    })
})
