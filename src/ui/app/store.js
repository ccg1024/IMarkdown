import { configureStore } from '@reduxjs/toolkit'
import fileContentReducer from './reducers/fileContentSlice'
import recentFilesReducer from './reducers/recentFilesSlice'
import currentFileReducer from './reducers/currentFileSlice'

const store = configureStore({
  reducer: {
    fileContent: fileContentReducer,
    recentFiles: recentFilesReducer,
    currentFile: currentFileReducer
  }
})

export const getCurrentMarkHead = () => {
  const { recentFiles, currentFile } = store.getState()
  return recentFiles.value[currentFile.value]
}

export default store
