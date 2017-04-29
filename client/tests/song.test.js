/*global describe, it */
//import {expect} from 'chai'
import Song from '../app/song.js'
import {shallow} from 'enzyme'

describe('song', () => {
  const aSong = {
    "name":"Sous Les Jupes Des Filles",
    "file": "11 Sous Les Jupes Des Filles.mp3"
  }
  const changeCurrentSong = (x)=>x

  it('renders', () => {
    shallow(<Song song={aSong} changeCurrentSong={changeCurrentSong} />)
  })
})
