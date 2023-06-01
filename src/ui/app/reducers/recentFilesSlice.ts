import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface RecentFilesPayload {
  id?: string
  date?: string
  desc?: string
  title?: string
  isChange?: boolean
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
      if (action.payload.id) {
        state.value[action.payload.id] = {
          id: action.payload.id,
          date: action.payload.date,
          desc: action.payload.desc,
          title: action.payload.title,
          isChange: action.payload.isChange
        }
      }
    },
    updateFileTitle: (state, action: PayloadAction<RecentFilesPayload>) => {
      if (action.payload.id) {
        state.value[action.payload.id].title = action.payload.title
      }
    },
    updateFileDesc: (state, action: PayloadAction<RecentFilesPayload>) => {
      if (action.payload.id) {
        state.value[action.payload.id].desc = action.payload.desc
      }
    },
    updateFileIsChange: (state, action: PayloadAction<RecentFilesPayload>) => {
      if (action.payload.id) {
        state.value[action.payload.id].isChange = action.payload.isChange
      }
    }
  }
})

export const selectRecentFiles = (state: RootState) => state.recentFiles.value

export const {
  updateRecentFiles,
  updateFileTitle,
  updateFileDesc,
  updateFileIsChange
} = recentFilesSlice.actions

export default recentFilesSlice.reducer
