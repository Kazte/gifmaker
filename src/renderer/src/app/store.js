import { configureStore } from '@reduxjs/toolkit'
import playerReducer from '../features/player/playerSlice'

export default configureStore({
  reducer: {
    player: playerReducer
  }
})
