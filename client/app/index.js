//import Inferno from 'inferno'
//let render = Inferno.render
import React from 'react'
import {render} from 'react-dom'

import $ from 'jquery'
import App from './views/app.js'
import Model from './models/model.js'

let model = new Model()
window.React = React

const getData = () => {
  $.ajax({
    url:'data/library.json',
    error: (xhr) => {
      alert('failure: ' + xhr.responseText)
    },
    success: (data) => {
      model.setSonglist(data)
      //songlist =  data
      renderApp(model)
    }
  })
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

const renderApp = (model) => {
  render(<App songs={model.getFilteredSonglist()} current={model.getCurrentSong}
    changeCurrentSong={changeCurrentSong} songEnded={songEnded} changeFilter={changeFilter}/>,
    document.getElementById('app-container'))

}
