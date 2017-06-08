import {displayError} from '../utils/util.js'

function prepSongForPlay(song) {
  if (!song) {
    return null
  }
  return song.URL
}

function reportError(e) {
  // audio playback failed - show a message saying why
  // to get the source of the audio element use $(this).src
  switch (e.target.error.code) {
    case e.target.error.MEDIA_ERR_ABORTED:
      displayError('You aborted the video playback.')
      break
    case e.target.error.MEDIA_ERR_NETWORK:
      displayError('A network error caused the audio download to fail.')
      break
    case e.target.error.MEDIA_ERR_DECODE:
      displayError('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.')
      break
    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      displayError('The video audio not be loaded, either because the server or network failed or because the format is not supported.')
      break
    default:
      displayError('An unknown error occurred.')
      break
  }
}


const Player = ({current, songEnded}) =>(
  <div className="player-container">
    <div id="player" className="player">
      <audio controls="controls" autoPlay="true" onError={reportError} onEnded={songEnded} src={prepSongForPlay(current)} type="audio/mpeg">
      Something went wrong.
    </audio>
  </div>
  </div>
)

export default Player
