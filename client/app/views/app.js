import Songlist from './songlist.js'
import Player from './player.js'
import Filter from './filter.js'

const App = ({songs, current, changeCurrentSong, songEnded, changeFilter}) => (
  <section id="appsection">
    <Player current={current} songEnded={songEnded}/>
    <Filter changeFilter={changeFilter}/>
    <Songlist songs={songs} changeCurrentSong={changeCurrentSong}/>
  </section>
)

export default App
