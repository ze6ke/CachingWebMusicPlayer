/*global describe, it */
//import {expect} from 'chai'
import App from '../../app/views/app.js'
import {shallow} from 'enzyme'


describe('App', () => {
  const songs = [
    {
      'name':'Sous Les Jupes Des Filles',
      'file': '11 Sous Les Jupes Des Filles.mp3'
    },
    {
      'name':'In the Club v Closer',
      'file': '01 In the Club vs Closer.mp3'
    }
  ]

  const changeCurrentSong = (x)=>x

  it('renders', () => {
    shallow(<App  songs={songs} current='' changeCurrentSong={changeCurrentSong} />)
  })

  it('renders with an active song', () => {
    shallow(<App  songs={songs} current={songs[0]} changeCurrentSong={changeCurrentSong} />)
  })
})
