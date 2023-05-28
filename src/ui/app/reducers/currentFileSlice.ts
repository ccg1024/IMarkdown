import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface CurrentFileState {
  value: string
}

const initialState: CurrentFileState = {
  value: ''
}

export const currentFileSlice = createSlice({
  name: 'currentFile',
  initialState,
  reducers: {
    updateCurrentFile: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    }
  }
})

export const selectCurrentFile = (state: RootState) => state.currentFile.value

export const { updateCurrentFile } = currentFileSlice.actions

export default currentFileSlice.reducer
