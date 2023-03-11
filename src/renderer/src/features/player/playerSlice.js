import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playing: false,
  currentTime: 0,
  duration: 0,
  cutStart: 0,
  cutEnd: undefined,
  volume: 0.5,
  repeat: true
}

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    play: (state) => {
      state.playing = true
    },
    pause: (state) => {
      state.playing = false
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload
    },
    setDuration: (state, action) => {
      state.duration = action.payload
      state.cutEnd = action.payload
    },
    setCutStart: (state, action) => {
      state.cutStart = action.payload
    },
    setCutEnd: (state, action) => {
      state.cutEnd = action.payload
    },
    setVolume: (state, action) => {
      state.volume = action.payload
    },
    setRepeat: (state, action) => {
      state.repeat = action.payload
    }
  }
})

export const { play, pause, setCurrentTime, setDuration, setCutStart, setCutEnd, setVolume, setRepeat } =
  playerSlice.actions

export default playerSlice.reducer
