import Song from './song.js'

const Songlist = ({songs, changeCurrentSong}) => (
  <section id="songlist">
  <ul>
    {songs.map((song, i) =>
       <Song key={i} song={song} changeCurrentSong={changeCurrentSong} />
    )}
  </ul>
  </section>
)

export default Songlist
