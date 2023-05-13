import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface RecentFilesPayload {
  id?: string // for key of RecentFilesStateItem
  date?: string
  desc?: string
  title?: string
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
    modifyRecentFiles: (state, action: PayloadAction<RecentFilesPayload>) => {
      state.value[action.payload.id] = {
        id: action.payload.id,
        date: action.payload.date,
        title: action.payload.title,
        desc: action.payload.desc
      }
    },
    modifyFileTitle: (state, action: PayloadAction<RecentFilesPayload>) => {
      state.value[action.payload.id] = {
        ...state.value[action.payload.id],
        title: action.payload.title
      }
    },
    modifyFileDesc: (state, action: PayloadAction<RecentFilesPayload>) => {
      state.value[action.payload.id] = {
        ...state.value[action.payload.id],
        desc: action.payload.desc
      }
    }
  }
})

export const selectRecentFiles = (state: any) => state.recentFiles.value

export const { modifyRecentFiles, modifyFileTitle, modifyFileDesc } =
  recentFilesSlice.actions

export default recentFilesSlice.reducer
