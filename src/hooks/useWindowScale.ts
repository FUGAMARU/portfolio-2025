import { useLayoutEffect, useRef, useState } from "react"

import windowContainerStyles from "@/components/parts/window/WindowContainer/index.module.css"

import type { RefObject } from "react"

/**
 * WindowContainerの幅を基準にCSSカスタムプロパティ`--window-scale`用のスケール値を計算するフック
 *
 * @param rootRef - Window内コンテンツのルート要素を指す ref
 * @param isMaximizing - trueの場合はviewport横幅を基準にスケール値を計算する
 */
export const useWindowScale = (rootRef: RefObject<HTMLElement | null>, isMaximizing: boolean) => {
  const [windowScale, setWindowScale] = useState(1)
  const baseWidthRef = useRef<number>(null) // 通常モードで測った「基準幅」を保持しておく

  useLayoutEffect(() => {
    const rootElement = rootRef.current
    if (rootElement === null) {
      return
    }

    const windowElement = rootElement.closest(`.${windowContainerStyles.windowContainer}`)
    if (windowElement === null) {
      return
    }

    // 通常モード: WindowContainer幅ベースでスケール（常に観測しておく）
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect

      if (isMaximizing) {
        return
      }

      // 通常時は WindowContainer の初回幅を基準として保持
      if (baseWidthRef.current === null) {
        baseWidthRef.current = width
      }

      const baseWidth = baseWidthRef.current
      if (baseWidth !== null && baseWidth > 0) {
        const nextScale = Math.max(1, width / baseWidth)
        setWindowScale(nextScale)
      }
    })

    resizeObserver.observe(windowElement)

    // 最大化モード: viewport ベースでスケール
    let resizeListener: (() => void) | undefined
    if (isMaximizing) {
      /** viewportリサイズ時にスケールを再計算する */
      const handleResize = () => {
        const currentWidth = window.innerWidth
        const baseWidth = baseWidthRef.current ?? currentWidth

        if (baseWidth > 0) {
          const nextScale = Math.max(1, currentWidth / baseWidth)
          setWindowScale(nextScale)
        }
      }

      // 最大化に入ったタイミングでも一度計算
      handleResize()
      window.addEventListener("resize", handleResize)
      resizeListener = handleResize
    }

    return () => {
      resizeObserver.disconnect()
      if (resizeListener !== undefined) {
        window.removeEventListener("resize", resizeListener)
      }
    }
  }, [rootRef, isMaximizing])

  return windowScale
}
