import Songlist from './songlist.js'
import Player from './player.js'
import Filter from './filter.js'
import Hamburger from './hamburger.js'

const App = ({songs, current, callbacks /* changeCurrentSong, songEnded, changeFilter, clearCachedData, showDataUsage, resetCachedData, grabHeader, grabHeaderPlaceholder */}) => (
  <main id="appsection">
    <div className="header-placeholder" ref={callbacks.grabHeaderPlaceholder}>
    </div>
    <header ref={callbacks.grabHeader}>
      <span className="title-bar">
        <h1>Music Player</h1><Hamburger
          clearCachedData={callbacks.clearCachedData} showDataUsage={callbacks.showDataUsage} resetCachedData={callbacks.resetCachedData}/>
      </span>
      <Player current={current} songEnded={callbacks.songEnded}/>
      <Filter changeFilter={callbacks.changeFilter} songs={songs}/>
      <hr />
    </header>
    <Songlist songs={songs} changeCurrentSong={callbacks.changeCurrentSong}/>
  </main>
)

export default App
