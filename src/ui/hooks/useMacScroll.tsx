import { useLayoutEffect } from 'react'

export const useMackScroll = () => {
  useLayoutEffect(() => {
    const platform = window.ipcAPI.getPlatform()
    if (platform !== 'darwin') {
      document.getElementById('root').classList.add('mac_scrollbar')
    }
  }, [])
}
