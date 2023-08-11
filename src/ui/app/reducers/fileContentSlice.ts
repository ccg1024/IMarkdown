import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { HeadInfo } from 'src/types'
import { copyProp } from 'src/ui/libs/tools'
import { RootState } from '../store'

export type FileContentType = {
  content: string
  headinfo: HeadInfo<string>
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
    updateFileHeadInfo: (state, action: PayloadAction<HeadInfo<string>>) => {
      let key: keyof HeadInfo<string>
      for (key in action.payload) {
        // state.value.headinfo[key] = action.payload[key]
        copyProp(state.value.headinfo, action.payload, key)
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
