import { configureStore } from '@reduxjs/toolkit'
import currentFileReducer from './reducers/currentFileSlice'
import fileContentReducer from './reducers/fileContentSlice'
import recentFilesReducer from './reducers/recentFilesSlice'
import { RecentFilesPayload } from './reducers/recentFilesSlice'

const store = configureStore({
  reducer: {
    currentFile: currentFileReducer,
    fileContent: fileContentReducer,
    recentFiles: recentFilesReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const getMarkHead = (): RecentFilesPayload => {
  const { recentFiles, currentFile } = store.getState()
  return recentFiles.value[currentFile.value]
}

export const getCurrentFile = (): string => {
  const { currentFile } = store.getState()
  return currentFile.value
}

export default store
