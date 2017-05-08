//import Inferno from 'inferno'
//let render = Inferno.render
import React from 'react'
import {render} from 'react-dom'

//import $ from 'jquery'
import App from './views/app.js'
import Model from './models/model.js'
import functionalityTest from './functionalityTest.js'

functionalityTest()

let model = new Model(renderApp)
window.React = React

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

getData()

const changeCurrentSong = (song) => {
  model.changeCurrentSong(song)
  renderApp(model)
}

const changeFilter = (e) => {
  model.changeFilter(e.target.value)
  renderApp(model)
}

const songEnded = () => {
  changeCurrentSong(model.getNextSong())
}

function renderApp (model) {
  render(<App songs={model.getFilteredSonglist()} current={model.getCurrentSong()}
    changeCurrentSong={changeCurrentSong} songEnded={songEnded} changeFilter={changeFilter}
    clearCachedData={model.clearCachedData} showDataUsage={model.showDataUsage}/>,
    document.getElementById('app-container'))
}
