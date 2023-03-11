import './index.css'
import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { play, pause, setCurrentTime, setDuration, setVolume, setCutStart, setCutEnd, setRepeat } from '../../features/player/playerSlice'
import { formatDuration } from '../../utils/format'
import { Timeline } from '../Timeline'
import { IconPlayerPlayFilled, IconPlayerPauseFilled, IconVolume3, IconVolume2, IconVolume, IconBoxAlignLeft, IconBoxAlignRight, IconRepeat, IconRepeatOff, IconEraser } from '@tabler/icons-react';

const volumeIcons = {
  0: 'IconVolume3',
  0.5: 'IconVolume2',
  1: 'IconVolume'
}

export const VideoPreview = ({ path }) => {
  const { playing, duration, currentTime, volume, cutStart, cutEnd, repeat } = useSelector((state) => state.player)
  const dispatch = useDispatch()
  const videoRef = useRef()

  const [delta, setDelta] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const getVideo = () => videoRef.current

  useEffect(() => {
    if (playing) {

      const curTime = getVideo().currentTime

      if (curTime < cutStart) {
        getVideo().currentTime = cutStart
        dispatch(setCurrentTime(cutStart))
      } else if (curTime >= cutEnd) {
        getVideo().currentTime = cutStart
        dispatch(setCurrentTime(cutStart + 0.1))
      }

      getVideo().play()
    } else {
      getVideo().pause()
    }
    getVideo().volume = volume
  }, [playing, volume])

  useEffect(() => {
    dispatch(setCutStart(0))
    dispatch(setCutEnd(duration))

  }, [videoRef])



  const handleOnDurationChange = (e) => {
    setDuration(e.target.duration)
    dispatch(setDuration(e.target.duration))
  }

  const handleOnTimeUpdate = (e) => {
    let curTime = e.target.currentTime

    if (playing) {
      if (curTime >= cutEnd) {

        if (!repeat) {
          dispatch(pause())
        }

        getVideo().currentTime = cutStart
        curTime = cutStart
      }
      dispatch(setCurrentTime(curTime))
    }
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

  const handleCutStart = () => {
    const tentaiveCutStart = currentTime

    if (tentaiveCutStart >= cutEnd) {
      dispatch(setCutEnd(duration))
    }
    dispatch(setCutStart(tentaiveCutStart))
  }

  const handleCutEnd = () => {
    const tentaiveCutEnd = currentTime

    if (tentaiveCutEnd <= cutStart) {
      dispatch(setCutStart(0))
    }
    dispatch(setCutEnd(tentaiveCutEnd))
  }

  const handleRepeat = () => {
    dispatch(setRepeat(!repeat))
  }

  const handleResetCuts = () => {
    dispatch(setCutStart(0))
    dispatch(setCutEnd(duration))
  }


  return (
    <>
      <div className="video-preview">
        <video
          ref={videoRef}
          src={path}
          loop={repeat}
          onDurationChange={handleOnDurationChange}
          onTimeUpdate={handleOnTimeUpdate}
          onPlay={() => dispatch(play())}
          onPause={() => dispatch(pause())}
          volume={volume}
          onEnded={() => dispatch(pause())}
        >
          Your browser does not support the video tag.
        </video>



        <div className='video-preview__volume-slider'>
          <div className='video-preview__volume-button' title={`${showVolumeSlider ? 'Hide' : 'Show'} volume slider`}>
            {
              volume === 0 ? <IconVolume3 onClick={() => setShowVolumeSlider(!showVolumeSlider)} size={30} /> :
                volume <= 0.5 ? <IconVolume2 onClick={() => setShowVolumeSlider(!showVolumeSlider)} size={30} /> :
                  <IconVolume onClick={() => setShowVolumeSlider(!showVolumeSlider)} size={30} />
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

      <div style={{ display: "flex" }}>
        <Timeline currentTime={currentTime} duration={duration}
          onHandleTimelineClick={handleTimelineClick}
          onHandleMouseDown={handleMouseDown}
          onHandleMouseUp={handleMouseUp}
          onHandleMouseMove={handleMouseMove}
          startCut={cutStart}
          endCut={cutEnd}
        />
      </div>

      <div className="controls-wrapper">
        <button onClick={handleResetCuts} title="Reset Cuts">
          <IconEraser size={30} />
        </button>
        <button onClick={handleCutStart} title="Cut Start">
          <IconBoxAlignLeft size={30} />
        </button>
        <button
          onClick={() => {
            if (playing) {
              dispatch(pause())
            } else {
              dispatch(play())
            }
          }}
          title={playing ? "Pause" : "Play"}
        >
          {playing ?
            <IconPlayerPauseFilled size={30} />
            : <IconPlayerPlayFilled size={30} />}
        </button>
        <button onClick={handleCutEnd} title="Cut End">
          <IconBoxAlignRight size={30} />
        </button>

        <button onClick={handleRepeat} title={repeat ? "Turn Off Repeat" : "Turn On Repeat"}>
          {repeat ? <IconRepeat size={30} /> : <IconRepeatOff size={30} />}
        </button>

      </div>
    </>
  )
}
