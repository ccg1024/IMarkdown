import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

import { MarkFile } from '../../../window/tools'

export const dirlistSlice = createSlice({
  name: 'dirlist',
  initialState: {
    value: null
  },
  reducers: {
    updateDirlist: (state, action: PayloadAction<MarkFile[]>) => {
      state.value = action.payload
    }
  }
})

export const selectDirlist = (state: RootState): MarkFile[] =>
  state.dirlist.value

export const { updateDirlist } = dirlistSlice.actions

export default dirlistSlice.reducer
