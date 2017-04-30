const Player = ({current, songEnded}) =>(
  <div id="player"><audio controls autoPlay="true" onEnded={songEnded} src={current? 'data/' + current.file : ''}>
    Something went wrong.
  </audio>
  </div>
)

export default Player
