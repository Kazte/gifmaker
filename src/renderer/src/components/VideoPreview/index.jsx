import './index.css'
import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { play, pause, setCurrentTime, setDuration } from '../../features/player/playerSlice'
import { formatDuration } from '../../utils/format'

export const VideoPreview = ({ path }) => {
  const { playing, duration, currentTime } = useSelector((state) => state.player)
  const dispatch = useDispatch()
  const videoRef = useRef()

  const [delta, setDelta] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const getVideo = () => videoRef.current

  useEffect(() => {
    if (playing) {
      getVideo().play()
    } else {
      getVideo().pause()
    }
  }, [playing, videoRef])

  const handleOnDurationChange = (e) => {
    setDuration(e.target.duration)
    dispatch(setDuration(e.target.duration))
  }

  const handleOnTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime)
    dispatch(setCurrentTime(e.target.currentTime))
  }

  const handleTimelineClick = (e) => {
    const { left, width } = e.target.getBoundingClientRect()
    const { duration } = getVideo()
    const clickPosition = e.clientX - left
    const clickPositionInPercent = clickPosition / width
    const newCurrentTime = clickPositionInPercent * duration

    getVideo().currentTime = newCurrentTime
    dispatch(setCurrentTime(newCurrentTime))
  }

  const handleMouseDown = (e) => {
    console.log('down')
    setIsDragging(true)
    setDelta(e.clientX - e.target.offsetLeft)
  }

  const handleMouseUp = () => {
    console.log('up')
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const { left, width } = e.target.getBoundingClientRect()
      const { duration } = getVideo()
      const clickPosition = e.clientX - left
      const clickPositionInPercent = clickPosition / width
      const newCurrentTime = clickPositionInPercent * duration

      getVideo().currentTime = newCurrentTime
      dispatch(setCurrentTime(newCurrentTime))
      console.log('move')
    } else {
      console.log('moveElse')
    }
  }

  return (
    <>
      <div className="video-preview">
        <video
          ref={videoRef}
          src={path}
          loop
          autoPlay
          onDurationChange={handleOnDurationChange}
          onTimeUpdate={handleOnTimeUpdate}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div
        id="timeline"
        className="timeline"
        onClick={handleTimelineClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        <p className="video-preview__time">{`${formatDuration(currentTime)}`}</p>
        <div
          className="current-time"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          draggable="true"
        />
      </div>

      <div className="controls-wrapper">
        <button
          style={{ minWidth: '100px' }}
          onClick={() => {
            if (playing) {
              dispatch(pause())
            } else {
              dispatch(play())
            }
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </>
  )
}
