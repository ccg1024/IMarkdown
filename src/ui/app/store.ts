import { configureStore } from '@reduxjs/toolkit'
import currentFileReducer from './reducers/currentFileSlice'
import fileContentReducer from './reducers/fileContentSlice'
import recentFilesReducer from './reducers/recentFilesSlice'
import dirlistReducer from './reducers/dirlistSlice'

const store = configureStore({
  reducer: {
    currentFile: currentFileReducer,
    fileContent: fileContentReducer,
    recentFiles: recentFilesReducer,
    dirlist: dirlistReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const getMarkHead = () => {
  const { fileContent } = store.getState()
  return fileContent.value.headinfo
}

export const getDoc = () => {
  const { fileContent } = store.getState()
  return fileContent.value.content
}

export const getCurrentFile = (): string => {
  const { currentFile } = store.getState()
  return currentFile.value
}

export default store
