import './index.css'
import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { play, pause, setCurrentTime, setDuration, setVolume } from '../../features/player/playerSlice'
import { formatDuration } from '../../utils/format'
import { Timeline } from '../Timeline'
import { BsFillVolumeMuteFill, BsVolumeDownFill, BsFillVolumeUpFill } from "react-icons/bs";


const volumeIcons = {
  0: 'BsFillVolumeMuteFill',
  0.5: 'BsVolumeDownFill',
  1: 'BsFillVolumeUpFill'
}

export const VideoPreview = ({ path }) => {
  const { playing, duration, currentTime, volume } = useSelector((state) => state.player)
  const dispatch = useDispatch()
  const videoRef = useRef()

  const [delta, setDelta] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const getVideo = () => videoRef.current

  useEffect(() => {
    if (playing) {
      getVideo().play()
    } else {
      getVideo().pause()
    }
    getVideo().volume = volume
  }, [playing, volume])


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
    const clickPosition = (e.clientX - left) - 4
    const clickPositionInPercent = clickPosition / width
    const newCurrentTime = clickPositionInPercent * duration

    getVideo().currentTime = newCurrentTime
    dispatch(setCurrentTime(newCurrentTime))
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDelta(e.clientX - e.target.offsetLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const { left, width } = e.target.getBoundingClientRect()
      const { duration } = getVideo()
      const clickPosition = (e.clientX - left) - 4
      const clickPositionInPercent = clickPosition / width
      const newCurrentTime = clickPositionInPercent * duration

      getVideo().currentTime = newCurrentTime
      dispatch(setCurrentTime(newCurrentTime))
    }
  }

  const handleVolumeOnChange = (e) => {
    getVideo().volume = e.target.value / 100
    dispatch(setVolume(e.target.value / 100))
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
          onPlay={() => dispatch(play())}
          onPause={() => dispatch(pause())}
          volume={volume}
        >
          Your browser does not support the video tag.
        </video>



        <div className='video-preview__volume-slider'>
          <div className='video-preview__volume-button' title={`${showVolumeSlider ? 'Hide' : 'Show'} volume slider`}>
            {
              volume === 0 ? <BsFillVolumeMuteFill onClick={() => setShowVolumeSlider(!showVolumeSlider)} size={30} /> :
                volume <= 0.5 ? <BsVolumeDownFill onClick={() => setShowVolumeSlider(!showVolumeSlider)} size={30} /> :
                  <BsFillVolumeUpFill onClick={() => setShowVolumeSlider(!showVolumeSlider)} size={30} />
            }
          </div>
          {showVolumeSlider &&
            (
              <label>
                <input className='video-preview__volume-slider__input' type="range" min="0" max="100" step="1" value={volume * 100} onChange={handleVolumeOnChange} />
              </label>
            )
          }
        </div>
      </div>

      <Timeline currentTime={currentTime} duration={duration}
        onHandleTimelineClick={handleTimelineClick}
        onHandleMouseDown={handleMouseDown}
        onHandleMouseUp={handleMouseUp}
        onHandleMouseMove={handleMouseMove}
      />

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
