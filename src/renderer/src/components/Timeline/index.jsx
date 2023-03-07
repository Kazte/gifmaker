import { formatDuration } from '../../utils/format'
import './index.css'


export const Timeline = ({ currentTime, duration, onHandleTimelineClick, onHandleMouseDown, onHandleMouseUp, onHandleMouseMove }) => {
  return (<div
    id="timeline"
    className="timeline"
    onClick={onHandleTimelineClick}
    onMouseDown={onHandleMouseDown}
    onMouseUp={onHandleMouseUp}
    onMouseMove={onHandleMouseMove}
    onMouseLeave={onHandleMouseUp}
  >

    <div
      className="current-time"
      style={{ left: `${((currentTime / duration)) * 100}%` }}
      draggable="true"
    />
    <p className="video-preview__time">{`${formatDuration(currentTime)}`}</p>
  </div>)
}
