const Song = ({song, changeCurrentSong}) =>
  <li className="song" onClick={() => changeCurrentSong(song)}>{song.title}</li>

export default Song
