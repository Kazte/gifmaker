import { formatDuration } from '../../utils/format'
import './index.css'
import { useSelector } from 'react-redux'


export const Timeline = ({ currentTime, startCut, endCut, duration, onHandleTimelineClick, onHandleMouseDown, onHandleMouseUp, onHandleMouseMove }) => {

  // console.log(`Timeline, currentTime: ${currentTime}, startCut ${startCut}, endCut ${endCut}, duration ${duration}`);

  return (
    <>



      <div
        id="timeline"
        className="timeline"
        onClick={onHandleTimelineClick}
        onMouseDown={onHandleMouseDown}
        onMouseUp={onHandleMouseUp}
        onMouseMove={onHandleMouseMove}
        onMouseLeave={onHandleMouseUp}
      >
        <p className="time">{`${formatDuration(currentTime)}`}</p>
        {startCut > 0 && <div className="timeline__start-cut-line" style={
          {
            // left: `${(startCut / duration) * 100}%`,
            width: `${((startCut) / duration) * 100}%`,
          }
        } />}

        <div className="timeline__end-cut-line"
          style={{
            left: `${(endCut / duration) * 100}%`,
            width: `${100 - ((endCut / duration) * 100)}%`
          }}>
        </div>

        <div
          className="current-time"
          style={{ left: `${((currentTime / duration)) * 100}%` }}
          draggable="true"
        />
      </div>
    </>
  )
}
