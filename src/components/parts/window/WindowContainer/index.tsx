import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { Rnd } from "react-rnd"

import styles from "@/components/parts/window/WindowContainer/index.module.css"
import { WindowControl } from "@/components/parts/window/WindowControl"

import type { ComponentProps, ReactNode } from "react"

/** 位置指定用Props */
type PositionProps = {
  /** top */
  top?: number
  /** left */
  left?: number
  /** right */
  right?: number
  /** bottom */
  bottom?: number
  /** 位置変更時のコールバック */
  onPositionChange?: (position: {
    /** x */
    x: number
    /** y */
    y: number
  }) => void
}

/** WindowControlありの時のProps */
type PropsWithWindowControl = {
  /** WindowControlを表示するかどうか */
  hasWindowControl: true
} & ComponentProps<typeof WindowControl>

/** WindowControlなしの時のProps */
type PropsWithoutWindowControl = {
  /** WindowControlを表示するかどうか */
  hasWindowControl?: false
}

/** Props */
type Props = (PropsWithWindowControl | PropsWithoutWindowControl) &
  PositionProps & {
    /** Children */
    children: ReactNode
    /** フルスクリーン表示するかどうか */
    isFullScreen: boolean
    /** ウィンドウを固定表示するかどうか（ドラッグ移動・サイズ変更を禁止） */
    isFixed: boolean
    /** z-index */
    zIndex?: number
    /** ウィンドウがフォーカスされた時の処理 */
    onFocus?: () => void
  }

/** ウィンドウコンテナ */
export const WindowContainer = ({
  children,
  isFullScreen,
  isFixed,
  top,
  left,
  right,
  bottom,
  zIndex,
  onFocus,
  onPositionChange: handlePositionChange,
  ...windowControlProps
}: Props) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const rndRef = useRef<Rnd>(null)
  const windowContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isInitialized || windowContentRef.current === null || rndRef.current === null) {
      return
    }

    /** X座標を計算する */
    const calculateXPosition = (windowWidth: number, elementWidth: number): number => {
      if (left !== undefined) {
        return left
      }
      if (right !== undefined) {
        return windowWidth - elementWidth - right
      }
      return (windowWidth - elementWidth) / 2 // デフォルトは中央
    }

    /** Y座標を計算する */
    const calculateYPosition = (windowHeight: number, elementHeight: number): number => {
      if (top !== undefined) {
        return top
      }
      if (bottom !== undefined) {
        return windowHeight - elementHeight - bottom
      }
      return (windowHeight - elementHeight) / 2 // デフォルトは中央
    }

    /** 初期サイズを計測して位置を設定する */
    const measureAndSetInitialPosition = () => {
      const element = windowContentRef.current
      if (element === null) {
        return
      }

      const { offsetWidth, offsetHeight } = element
      setInitialSize({ width: offsetWidth, height: offsetHeight })

      const position = {
        x: calculateXPosition(window.innerWidth, offsetWidth),
        y: calculateYPosition(window.innerHeight, offsetHeight)
      }

      rndRef.current?.updatePosition(position)
      setIsInitialized(true)
    }

    // フォントや画像の読み込みを待ってから実行
    document.fonts.ready.then(measureAndSetInitialPosition)
  }, [isInitialized, top, left, right, bottom])

  // isFullScreenの場合はRndを使わない
  if (isFullScreen) {
    return (
      <div className={clsx(styles.windowContainer, styles.FullScreen)}>
        {windowControlProps.hasWindowControl === true && (
          <div className={styles.control}>
            <WindowControl {...windowControlProps} />
          </div>
        )}
        {children}
      </div>
    )
  }

  return (
    <Rnd
      ref={rndRef}
      default={{
        x: 0,
        y: 0,
        width: "auto",
        height: "auto"
      }}
      disableDragging={!isInitialized || isFixed}
      enableResizing={!isFixed}
      minHeight={initialSize.height ?? "auto"}
      minWidth={initialSize.width ?? "auto"}
      onDrag={(_, data) => {
        handlePositionChange?.({ x: data.x, y: data.y })
      }}
      style={{
        visibility: isInitialized ? "visible" : "hidden",
        zIndex: zIndex ?? "auto"
      }}
    >
      <div
        ref={windowContentRef}
        className={clsx(styles.windowContainer, isFullScreen && styles.FullScreen)}
        onClick={onFocus}
        onMouseDown={onFocus}
      >
        {windowControlProps.hasWindowControl === true && (
          <div className={styles.control}>
            <WindowControl {...windowControlProps} />
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </Rnd>
  )
}
