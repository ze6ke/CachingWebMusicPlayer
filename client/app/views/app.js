import Songlist from './songlist.js'
import Player from './player.js'
import Filter from './filter.js'
import Hamburger from './hamburger.js'

const App = ({songs, current, changeCurrentSong, songEnded, changeFilter, clearCachedData, showDataUsage, resetCachedData}) => (
  <section id="appsection">
    <div className="header-placeholder">
    </div>
    <div className="header">
      <span className="title-bar">
        <h1>Music Player</h1><Hamburger
        clearCachedData={clearCachedData} showDataUsage={showDataUsage} resetCachedData={resetCachedData}/>
      </span>
      <Player current={current} songEnded={songEnded}/>
      <Filter changeFilter={changeFilter} songs={songs}/>
      <hr />
    </div>
    <Songlist songs={songs} changeCurrentSong={changeCurrentSong}/>
  </section>
)

export default App
