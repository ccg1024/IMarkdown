import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { copyProp } from 'src/ui/libs/tools'
import { HeadInfo } from 'src/types'

type CurrentFileType = {
  doc: string
  headinfo: HeadInfo<string>
  filepath: string
  scrollPos?: number
}

interface CurrentFileState {
  value: CurrentFileType
}

const initialState: CurrentFileState = {
  value: {
    doc: '',
    headinfo: {},
    filepath: ''
  }
}

export const currentFileSlice = createSlice({
  name: 'currentFile',
  initialState,
  reducers: {
    updateCurrentFile: (state, action: PayloadAction<CurrentFileType>) => {
      state.value = action.payload
    },
    updateFileDoc: (state, action: PayloadAction<string>) => {
      state.value.doc = action.payload
    },
    updateFileHeadinfo(state, action: PayloadAction<HeadInfo<string>>) {
      let key: keyof HeadInfo<string>
      for (key in action.payload) {
        copyProp(state.value.headinfo, action.payload, key)
      }
    }
  }
})

export const selectCurrentFile = (state: RootState) => state.currentFile.value
export const selectFileDoc = (state: RootState) => state.currentFile.value.doc
export const selectFileHeadinfo = (state: RootState) =>
  state.currentFile.value.headinfo
export const selectFilepath = (state: RootState) =>
  state.currentFile.value.filepath

export const { updateCurrentFile, updateFileDoc, updateFileHeadinfo } =
  currentFileSlice.actions

export default currentFileSlice.reducer
