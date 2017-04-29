import Songlist from './songlist.js'
import Player from './player.js'

const App = ({songs, current, changeCurrentSong}) => (
  <section id="appsection">
    <Songlist songs={songs} changeCurrentSong={changeCurrentSong}/>
    <Player current={current}/>
  </section>
)

export default App
