//import Inferno from 'inferno'
//let render = Inferno.render
import React from 'react'
import {render} from 'react-dom'

import $ from 'jquery'
import App from './app.js'

window.React = React

const getData = () => {
  $.ajax({
    url:'data/library.json',
    error: (xhr) => {
      alert('failure: ' + xhr.responseText)
    },
    success: (data) => {
      songlist = data
      renderApp()
    }
  })
}

getData()

let songlist = []
let current = null

const changeCurrentSong = (song) => {
  current = song
  renderApp()
}

const renderApp = () => {
  render(<App songs={songlist} current={current} changeCurrentSong={changeCurrentSong}/>,
    document.getElementById('app-container'))

}
