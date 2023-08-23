import { configureStore } from '@reduxjs/toolkit'
import currentFileReducer from './reducers/currentFileSlice'
import recentFilesReducer from './reducers/recentFilesSlice'
import dirlistReducer from './reducers/dirlistSlice'

const store = configureStore({
  reducer: {
    currentFile: currentFileReducer,
    recentFiles: recentFilesReducer,
    dirlist: dirlistReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const getMarkHead = () => {
  const { currentFile } = store.getState()
  return currentFile.value.headinfo
}

export const getDoc = () => {
  const { currentFile } = store.getState()
  return currentFile.value.doc
}

export const getCurrentFile = (): string => {
  const { currentFile } = store.getState()
  return currentFile.value.filepath
}

export const getScrollPos = () => {
  const { currentFile } = store.getState()
  return currentFile.value.scrollPos
}

export default store
