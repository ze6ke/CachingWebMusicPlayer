/*global describe, it */
//import {expect} from 'chai'
import Player from '../app/player.js'
import {shallow} from 'enzyme'

describe('player', () => {
  const aSong = {
    "name":"Sous Les Jupes Des Filles",
    "file": "11 Sous Les Jupes Des Filles.mp3"
  }

  it('renders with a current song', () => {
    shallow(<Player current={aSong} />)
  })
  it('renders without a current ', () => {
    shallow(<Player current="" />)
  })
})
