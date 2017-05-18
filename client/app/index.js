//import Inferno from 'inferno'
//let render = Inferno.render
import React from 'react'
import {render} from 'react-dom'
import storageStrategy from './utils/storageStrategy.js'
import fetchStrategy from './utils/fetchStrategy.js'

//import $ from 'jquery'
import App from './views/app.js'
import Model from './models/model.js'
import functionalityTest from './functionalityTest.js'

window.React = React


functionalityTest()
let model
const getData = () => {
  fetch('data/library.json')
  .then((response) => {
    if(response.ok) {
      response.json().then((data) => {
        model.setSonglist(data)
        renderApp(model)
      })
    } else {
      alert(response.statusText)
    }
  }, (response) => {alert('fetch failed: ' + response)})
}

const changeCurrentSong = (song) => {
  model.changeCurrentSong(song).then(()=>renderApp(model))
  //renderApp(model)
}

const changeFilter = (e) => {
  model.changeFilter(e.target.value)
  renderApp(model)
}

const songEnded = () => {
  changeCurrentSong(model.getNextSong())
}

const clearCachedData = () => {
  return model.clearCachedData()
}

const showDataUsage = () => {
  return model.showDataUsage()
}

function renderApp (model) {
  render(<App songs={model.getFilteredSonglist()} current={model.getCurrentSong()}
    changeCurrentSong={changeCurrentSong} songEnded={songEnded} changeFilter={changeFilter}
    clearCachedData={clearCachedData} showDataUsage={showDataUsage}/>,
    document.getElementById('app-container'))
}

storageStrategy.getStrategy('indexedDB').then((ss) => {
  model = new Model(renderApp, ss, fetchStrategy.XHR)
  getData()
})
