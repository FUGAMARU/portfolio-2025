import { useLayoutEffect, useRef, useState } from "react"

import windowContainerStyles from "@/components/parts/window/WindowContainer/index.module.css"

import type { RefObject } from "react"

/**
 * WindowContainerの幅を基準にCSSカスタムプロパティ`--window-scale`用のスケール値を計算するフック
 *
 * @param rootRef - Window内コンテンツのルート要素を指す ref
 * @param isMaximizing - trueの場合はviewport内に収まるようスケール値を計算する
 */
export const useWindowScale = (rootRef: RefObject<HTMLElement | null>, isMaximizing: boolean) => {
  const [windowScale, setWindowScale] = useState(1)
  const baseWidthRef = useRef<number>(null) // 通常モードで測った「基準幅」を保持しておく
  const baseHeightRef = useRef<number>(null) // 通常モードで測った「基準高さ」を保持しておく

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
      const { width, height } = entry.contentRect

      if (isMaximizing) {
        return
      }

      // 通常時は WindowContainer の初回幅を基準として保持
      if (baseWidthRef.current === null) {
        baseWidthRef.current = width
      }

      // 通常時は WindowContainer の初回高さを基準として保持
      if (baseHeightRef.current === null) {
        baseHeightRef.current = height
      }

      const baseWidth = baseWidthRef.current
      const baseHeight = baseHeightRef.current

      if (baseWidth === null || baseHeight === null || baseWidth <= 0 || baseHeight <= 0) {
        return
      }

      // 幅だけでスケールすると、縦が詰まったアスペクト比でコンテンツが突き抜けるため
      // 幅・高さの両方を見てスケール上限を決める
      const widthScale = width / baseWidth
      const heightScale = height / baseHeight
      const nextScale = Math.max(1, Math.min(widthScale, heightScale))
      setWindowScale(nextScale)
    })

    resizeObserver.observe(windowElement)

    // 最大化モード: viewport ベースでスケール
    let resizeListener: (() => void) | undefined
    if (isMaximizing) {
      /** viewportリサイズ時にスケールを再計算する */
      const handleResize = () => {
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const baseWidth = baseWidthRef.current ?? viewportWidth
        const baseHeight = baseHeightRef.current ?? viewportHeight

        const computedStyle = getComputedStyle(windowElement)

        const parsedPaddingLeft = Number.parseFloat(computedStyle.paddingLeft)
        const parsedPaddingRight = Number.parseFloat(computedStyle.paddingRight)
        const parsedBorderLeft = Number.parseFloat(computedStyle.borderLeftWidth)
        const parsedBorderRight = Number.parseFloat(computedStyle.borderRightWidth)
        const parsedPaddingTop = Number.parseFloat(computedStyle.paddingTop)
        const parsedPaddingBottom = Number.parseFloat(computedStyle.paddingBottom)
        const parsedBorderTop = Number.parseFloat(computedStyle.borderTopWidth)
        const parsedBorderBottom = Number.parseFloat(computedStyle.borderBottomWidth)

        const paddingLeft = Number.isFinite(parsedPaddingLeft) ? parsedPaddingLeft : 0
        const paddingRight = Number.isFinite(parsedPaddingRight) ? parsedPaddingRight : 0
        const borderLeft = Number.isFinite(parsedBorderLeft) ? parsedBorderLeft : 0
        const borderRight = Number.isFinite(parsedBorderRight) ? parsedBorderRight : 0
        const paddingTop = Number.isFinite(parsedPaddingTop) ? parsedPaddingTop : 0
        const paddingBottom = Number.isFinite(parsedPaddingBottom) ? parsedPaddingBottom : 0
        const borderTop = Number.isFinite(parsedBorderTop) ? parsedBorderTop : 0
        const borderBottom = Number.isFinite(parsedBorderBottom) ? parsedBorderBottom : 0
        const availableWidth = Math.max(
          0,
          viewportWidth - (paddingLeft + paddingRight + borderLeft + borderRight)
        )

        const availableHeight = Math.max(
          0,
          viewportHeight - (paddingTop + paddingBottom + borderTop + borderBottom)
        )

        if (baseWidth <= 0 || baseHeight <= 0) {
          return
        }

        // WindowContainerの「実効コンテンツ領域」に収まるようスケールする
        const nextScale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight)
        setWindowScale(nextScale)
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
