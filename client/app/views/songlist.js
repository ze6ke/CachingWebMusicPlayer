import Song from './song.js'
import MyVirtualList from '../utils/virtualList.js'

const MyList = ({
  items,
  itemHeight,
  songs, 
  changeCurrentSong
}) => (
  <ul>
    {items.map((song, id) => (
      <Song key={id} /*style={{height: itemHeight}}*/ song={song} changeCurrentSong={changeCurrentSong} />
    ))}
  </ul>
)

const SonglistRaw = MyVirtualList()(MyList)

const Songlist = ({songs, changeCurrentSong}) => {
  return <section className="songlist" >
    <SonglistRaw items={songs} changeCurrentSong={changeCurrentSong} itemHeight={40} />
  </section>
}

/*const SonglistOld = ({songs, changeCurrentSong}) => (
  <section id="songlist">
  <ul>
    {songs.map((song, i) =>
       <Song key={i} song={song} changeCurrentSong={changeCurrentSong} />
    )}
  </ul>
  </section>
)*/

export default Songlist
