const Song = ({song, changeCurrentSong}) =>
  <li className="song" onClick={() => changeCurrentSong(song)}>{song.name}</li>

export default Song
