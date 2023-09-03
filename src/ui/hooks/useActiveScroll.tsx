import { useEffect } from 'react'

export const useActiveScroll = (id: string, isActive: boolean) => {
  useEffect(() => {
    if (isActive) {
      document.getElementById(id).scrollIntoView({ block: 'nearest' })
    }
  }, [id, isActive])
}
