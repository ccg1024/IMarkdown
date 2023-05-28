import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface FileContentState {
  value: string
}

const initialState: FileContentState = {
  value: ''
}

export const fileContentSlice = createSlice({
  name: 'fileContent',
  initialState,
  reducers: {
    updateFileContent: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    }
  }
})

export const selectFileContent = (state: RootState) => state.fileContent.value

export const { updateFileContent } = fileContentSlice.actions

export default fileContentSlice.reducer
