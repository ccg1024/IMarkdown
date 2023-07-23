import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { HeadInfo } from '../../../types/main'
import { RootState } from '../store'

export type FileContentType = {
  content: string
  headinfo: HeadInfo
}

interface FileContentState {
  value: FileContentType
}

const initialState: FileContentState = {
  value: {
    content: '',
    headinfo: {}
  }
}

export const fileContentSlice = createSlice({
  name: 'fileContent',
  initialState,
  reducers: {
    updateFile: (state, action: PayloadAction<FileContentType>) => {
      state.value = action.payload
    },
    updateFileContent: (state, action: PayloadAction<string>) => {
      state.value.content = action.payload
    },
    updateFileHeadInfo: (state, action: PayloadAction<HeadInfo>) => {
      let key: keyof HeadInfo
      for (key in action.payload) {
        state.value.headinfo[key] = action.payload[key]
      }
    }
  }
})

export const selectFileContent = (state: RootState) =>
  state.fileContent.value.content
export const selectFileHeadInfo = (state: RootState) =>
  state.fileContent.value.headinfo

export const { updateFileContent, updateFile, updateFileHeadInfo } =
  fileContentSlice.actions

export default fileContentSlice.reducer
