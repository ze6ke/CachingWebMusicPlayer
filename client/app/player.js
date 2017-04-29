const Player = ({current}) =>(
  <div id="player"><audio controls src={current? 'data/' + current.file : ''}>
    Something went wrong.
  </audio>
  </div>
)

export default Player
