import { PayloadAction, createSlice } from '@reduxjs/toolkit'

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
    modifyCurrentFile: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    }
  }
})

export const selectCurrentFile = (state: any) => state.currentFile.value

export const { modifyCurrentFile } = currentFileSlice.actions

export default currentFileSlice.reducer
