import Songlist from './songlist.js'
import Player from './player.js'
import Filter from './filter.js'

const App = ({songs, current, changeCurrentSong, songEnded, changeFilter}) => (
  <section id="appsection">
    <div className="header-placeholder">
    </div>
    <div className="header">
      <h1>Music Player</h1>
      <Player current={current} songEnded={songEnded}/>
      <Filter changeFilter={changeFilter} songs={songs}/>
      <hr />
    </div>
    <Songlist songs={songs} changeCurrentSong={changeCurrentSong}/>
  </section>
)

export default App
