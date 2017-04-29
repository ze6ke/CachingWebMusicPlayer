import Song from './song.js'

const Songlist = ({songs, changeCurrentSong}) => (
  <section id="songlist"><h2>Songs</h2>
  <div>Total songs: {songs.length}</div>
  <div><ul>
    {songs.map((song, i) =>
       <Song key={i} song={song} changeCurrentSong={changeCurrentSong} />
    )}
  </ul></div>
  </section>
)

export default Songlist
