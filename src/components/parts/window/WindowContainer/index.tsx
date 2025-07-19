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
    /** z-index */
    zIndex?: number
    /** ウィンドウがフォーカスされた時の処理 */
    onFocus?: () => void
  }

const DEFAULT_POSITION = {
  x: 0,
  y: 0,
  width: "auto",
  height: "auto"
} as const satisfies ComponentProps<typeof Rnd>["default"]

/** ウィンドウコンテナ */
export const WindowContainer = ({
  children,
  isFullScreen,
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

    /** childrenの初期サイズの計測とSet */
    const measureInitialSizeAndSetPosition = () => {
      const element = windowContentRef.current

      if (element === null) {
        return
      }

      const { offsetWidth, offsetHeight } = element
      setInitialSize({ width: offsetWidth, height: offsetHeight })

      let x = 0
      let y = 0

      if (left !== undefined) {
        x = left
      } else if (right !== undefined) {
        x = window.innerWidth - offsetWidth - right
      }

      if (top !== undefined) {
        y = top
      } else if (bottom !== undefined) {
        y = window.innerHeight - offsetHeight - bottom
      }

      rndRef.current?.updatePosition({ x, y })

      setIsInitialized(true)
    }

    document.fonts.ready.then(measureInitialSizeAndSetPosition) // フォントや画像の読み込みを待ってから実行
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
      default={DEFAULT_POSITION}
      disableDragging={!isInitialized}
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
