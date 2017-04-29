/*global describe, it */
import {expect} from 'chai'
import Songlist from '../app/songlist.js'
import {shallow} from 'enzyme'

describe('Songlist', () => {
  const songs = [
    {
      "name":"Sous Les Jupes Des Filles",
      "file": "11 Sous Les Jupes Des Filles.mp3"
    },
    {
      "name":"In the Club v Closer",
      "file": "01 In the Club vs Closer.mp3"
    }
  ]

  const changeCurrentSong = (x)=>x

  it('renders', () => {
    shallow(<Songlist songs={songs} changeCurrentSong={changeCurrentSong} />)
  })

  it('renders each song', () => {
    const rendered = shallow(<Songlist songs={songs} changeCurrentSong={changeCurrentSong} />)
    expect(rendered.find('Song').length).to.equal(songs.length)
  })
})
