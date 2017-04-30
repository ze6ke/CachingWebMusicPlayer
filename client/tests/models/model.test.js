/*global describe, it */
import Model from '../../app/models/model.js'
import {expect} from 'chai'

describe('model', () => {
  const songlist = [
    {name: 'this is a name', file: '1'},
    {name: 'this is a name', genre: 'a genre', file: '2'},
    {name: 'song 3', genre: 'genre', file: '3'}
  ]

  it('identifies strings correctly', () => {
    expect(Model.isString('hi')).to.equal(true)
    expect(Model.isString(5)).to.equal(false)
  })
  it('songMatchesFilter works correctly on 1x1', () => {
    const singleItemSong = songlist[0]
    const validCriterion1 = 'name'
    const invalidCriterion1 = 'names'

    expect(Model.songMatchesFilter(singleItemSong, validCriterion1)).to.equal(true)
    expect(Model.songMatchesFilter(singleItemSong, invalidCriterion1)).to.equal(false)
  })

  it('songMatchesFilter works correctly on 2x1', () => {
    const multiItemSong1 = songlist[1]
    const multiItemSong2 = songlist[2]
    const criterion1 = 'name'
    const validCriterion2 = 'genre'
    const invalidCriterion1 = 'names'

    expect(Model.songMatchesFilter(multiItemSong1, criterion1)).to.equal(true)
    expect(Model.songMatchesFilter(multiItemSong1, validCriterion2)).to.equal(true)
    expect(Model.songMatchesFilter(multiItemSong1, invalidCriterion1)).to.equal(false)
    expect(Model.songMatchesFilter(multiItemSong2, criterion1)).to.equal(false)

  })

  it('songMatchesFilter works correctly on 2x2', () => {
    const multiItemSong = songlist[1]
    const validCriterion1 = 'name genre'
    const invalidCriterion1 = 'names genre'

    expect(Model.songMatchesFilter(multiItemSong, validCriterion1)).to.equal(true)
    expect(Model.songMatchesFilter(multiItemSong, invalidCriterion1)).to.equal(false)
  })

  it('songMatchesFilter works correctly on empty filter', () => {
    const multiItemSong = songlist[1]
    const validCriterion1 = ''

    expect(Model.songMatchesFilter(multiItemSong, validCriterion1)).to.equal(true)
  })

  it('getFilteredSonglist works correctly with empty filter', () => {
    let model = new Model()
    model.setSonglist(songlist)
    expect(model.getFilteredSonglist()).to.deep.equal(songlist)
  })

  it('getFilteredSonglist works correctly with a filter', () => {
    let model = new Model()
    model.setSonglist(songlist)
    model.changeFilter('s')
    expect(model.getFilteredSonglist()).to.have.lengthOf(3)
    model.changeFilter('genre')
    expect(model.getFilteredSonglist()).to.have.lengthOf(2)
    model.changeFilter('name genre')
    expect(model.getFilteredSonglist()).to.have.lengthOf(1)
  })

  it('getNextSong works correctly with unfiltered list', () => {
    let model = new Model()
    model.setSonglist(songlist)
    model.changeCurrentSong(model.getNextSong())
    expect(model.getCurrentSong()).to.deep.equal(songlist[1])
    model.changeCurrentSong(model.getNextSong())
    expect(model.getCurrentSong()).to.deep.equal(songlist[2])
    model.changeCurrentSong(model.getNextSong())
    expect(model.getCurrentSong()).to.deep.equal(songlist[0])
  })

  it('getNextSong works correctly with filtered list', () => {
    let model = new Model()
    model.setSonglist(songlist)
    model.changeFilter('song')
    model.changeCurrentSong(model.getNextSong())
    expect(model.getCurrentSong()).to.deep.equal(songlist[2])
    model.changeCurrentSong(model.getNextSong())
    expect(model.getCurrentSong()).to.deep.equal(songlist[2])
    model.changeFilter('genre')
    model.changeCurrentSong(model.getNextSong())
    expect(model.getCurrentSong()).to.deep.equal(songlist[1])
  })
})
