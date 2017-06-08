const Song = ({style, song, changeCurrentSong}) =>
  <li style={style} className="song" onClick={() => changeCurrentSong(song)}>
    <div className="song-row">
      <span className="song-title">{song.title}</span>
      <span className="song-artist">{song.artist}</span>
    </div>
    <div className="song-row">
      <span className="song-genre">{song.genre}</span>
      <span className="song-album">{song.album}</span>
    </div>
  </li>

export default Song
