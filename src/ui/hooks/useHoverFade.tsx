import React, { useRef, useEffect } from 'react'

type DivRef = React.MutableRefObject<HTMLDivElement>

/**
 * A hook that add mouseenter and mouseleave event to `target`
 *
 * @param target The ref of target element which will be add event listener
 */
export const useHoverFade = (target: DivRef) => {
  const timer = useRef<NodeJS.Timeout>(null)
  useEffect(() => {
    const { current: container } = target

    if (!container) {
      return
    }

    const mouseEnter = () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      container.style.opacity = '1'
    }
    const mouseLeave = () => {
      timer.current = setTimeout(() => {
        container.style.opacity = '0'
      }, 1000)
    }
    const clear = () => {
      container.removeEventListener('mouseenter', mouseEnter)
      container.removeEventListener('mouseleave', mouseLeave)
    }

    container.addEventListener('mouseenter', mouseEnter)
    container.addEventListener('mouseleave', mouseLeave)

    return clear
  }, [])
}
