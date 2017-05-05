const Player = ({current, songEnded}) =>(
  <div className="player-container">
    <div id="player" className="player">
      <audio controls="controls" autoPlay="true" onEnded={songEnded} src={current? 'data/' + current.file : ''}>
      Something went wrong.
    </audio>
  </div>
  </div>
)

export default Player
