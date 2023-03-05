import './index.css'
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { play, pause, setCurrentTime, setDuration } from '../../features/player/playerSlice'
import { formatDuration } from '../../utils/format'

export const VideoPreview = ({ path }) => {
  const { playing, duration, currentTime } = useSelector((state) => state.player)
  const dispatch = useDispatch()
  const videoRef = useRef()

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

      <p className="video-preview__time">{`${formatDuration(currentTime)} : ${formatDuration(
        duration
      )}`}</p>

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
