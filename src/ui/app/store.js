import { configureStore } from '@reduxjs/toolkit'
import fileContentReducer from './reducers/fileContentSlice'

export default configureStore({
  reducer: {
    fileContent: fileContentReducer
  }
})
