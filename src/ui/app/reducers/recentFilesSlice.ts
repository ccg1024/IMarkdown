/**
 * just save file information which have already open
 */

import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { MarkFile } from '../../../window/tools'

export type RecentFilesPayload = {
  filepath: string
  fileInfo: Partial<Omit<MarkFile, 'id'>>
  isChange: boolean
  didModified?: boolean // indicate whether the file has been modified during current display phase
}

export interface RecentFilesStateItem {
  [key: string]: RecentFilesPayload
}

interface RecentFilesState {
  value: RecentFilesStateItem
}

const initialState: RecentFilesState = {
  value: {}
}

export const recentFilesSlice = createSlice({
  name: 'recentFiles',
  initialState,
  reducers: {
    updateRecentFiles: (state, action: PayloadAction<RecentFilesPayload>) => {
      const { filepath, fileInfo, isChange, didModified } = action.payload
      if (filepath) {
        state.value[filepath] = {
          filepath: filepath,
          fileInfo: fileInfo,
          isChange: isChange,
          didModified: didModified
        }
      }
    },
    updateFileIsChange: (
      state,
      action: PayloadAction<Omit<RecentFilesPayload, 'fileInfo'>>
    ) => {
      const { filepath, isChange } = action.payload
      if (filepath) {
        state.value[filepath].isChange = isChange
        state.value[filepath].didModified = isChange
      }
    }
  }
})

export const selectRecentFiles = (state: RootState) => state.recentFiles.value

export const { updateRecentFiles, updateFileIsChange } =
  recentFilesSlice.actions

export default recentFilesSlice.reducer
