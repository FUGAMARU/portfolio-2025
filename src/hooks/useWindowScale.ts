import { useLayoutEffect, useState } from "react"

import windowContainerStyles from "@/components/parts/window/WindowContainer/index.module.css"

import type { RefObject } from "react"

/**
 * WindowContainer の幅を基準に CSS カスタムプロパティ `--window-scale` 用のスケール値を計算するフック
 *
 * @param rootRef - Window 内コンテンツのルート要素を指す ref
 */
export const useWindowScale = (rootRef: RefObject<HTMLElement | null>) => {
  const [windowScale, setWindowScale] = useState(1)

  useLayoutEffect(() => {
    const rootElement = rootRef.current
    if (rootElement === null) {
      return
    }

    const windowElement = rootElement.closest(`.${windowContainerStyles.windowContainer}`)
    if (windowElement === null) {
      return
    }

    let baseWidth: number | undefined
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect
      if (baseWidth === undefined) {
        baseWidth = width
      }

      if (baseWidth > 0) {
        const nextScale = Math.max(1, width / baseWidth)
        setWindowScale(nextScale)
      }
    })

    resizeObserver.observe(windowElement)

    return () => resizeObserver.disconnect()
  }, [rootRef])

  return windowScale
}
