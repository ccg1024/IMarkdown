import { createSlice } from '@reduxjs/toolkit'

export const fileContentSlice = createSlice({
  name: 'fileContent',
  initialState: {
    value: ''
  },
  reducers: {
    modifyContent: (state, action) => {
      state.value = action.payload
    }
  }
})

// the fileContent is defined in store.js, the key of fileContentReducer
export const selectFileContent = state => state.fileContent.value

export const { modifyContent } = fileContentSlice.actions

export default fileContentSlice.reducer
