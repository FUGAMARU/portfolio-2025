import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { Rnd } from "react-rnd"

import styles from "@/components/parts/window/WindowContainer/index.module.css"
import { WindowControl } from "@/components/parts/window/WindowControl"

import type { SizeLocationInfo } from "@/types"
import type { ReactNode } from "react"

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
  onPositionChange?: (position: Pick<SizeLocationInfo, "x" | "y">) => void
}

/** WindowControlありの時のProps */
type PropsWithWindowControl = {
  /** WindowControlを表示するかどうか */
  hasWindowControl: true
  /** 閉じるボタンを押下した時の処理 */
  onClose: () => void
  /** 最小化ボタンを押下した時の処理 */
  onMinimize: () => void
  /** 最大化ボタンを押下した時の処理 */
  onMaximize: (info?: SizeLocationInfo) => void
  /** 最大化前状態をクリアするコールバック */
  onClearBeforeMaximize?: () => void
}

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
    /** 表示制御（false→trueでopacityフェード） */
    shouldAppear?: boolean
    /** 最大化前のサイズと位置（最大化解除時に復元するため） */
    beforeMaximize?: SizeLocationInfo
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
  shouldAppear = true,
  beforeMaximize,
  ...windowControlProps
}: Props) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  /** 現在のウィンドウサイズ（beforeMaximize復元やリサイズ時に使用） */
  const [currentSize, setCurrentSize] = useState<Pick<SizeLocationInfo, "width" | "height">>()
  const rndRef = useRef<Rnd>(null)
  const windowContentRef = useRef<HTMLDivElement>(null)

  /** 最大化ボタンクリック時の処理 */
  const handleMaximizeClick = () => {
    if (windowControlProps.hasWindowControl !== true) {
      return
    }

    // 最大化する場合(現在非最大化状態)にのみサイズ情報を渡す
    if (!isFullScreen && rndRef.current !== null && windowContentRef.current !== null) {
      const rndElement = rndRef.current.resizableElement.current
      if (rndElement !== null) {
        const rect = rndElement.getBoundingClientRect()
        const draggableState = rndRef.current.draggable?.state as
          | Pick<SizeLocationInfo, "x" | "y">
          | undefined
        const position = draggableState ?? { x: rect.left, y: rect.top }

        const info = {
          x: position.x,
          y: position.y,
          width: rect.width,
          height: rect.height
        }
        windowControlProps.onMaximize(info)
        return
      }
    }

    // 最大化解除の場合、または情報が取得できなかった場合
    windowControlProps.onMaximize()
  }

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

  // beforeMaximizeによるサイズと位置の復元（最大化解除時のみ）
  useEffect(() => {
    if (!isInitialized || isFullScreen || beforeMaximize === undefined || rndRef.current === null) {
      return
    }

    rndRef.current.updatePosition({ x: beforeMaximize.x, y: beforeMaximize.y })
    // beforeMaximizeの値を使ってサイズを復元（derived stateだが、復元時のみ必要）
    setCurrentSize({ width: beforeMaximize.width, height: beforeMaximize.height })

    // 復元完了後にbeforeMaximizeをクリア
    const onClearBeforeMaximize =
      windowControlProps.hasWindowControl === true
        ? windowControlProps.onClearBeforeMaximize
        : undefined

    if (onClearBeforeMaximize !== undefined) {
      // 少し遅延させてから実行（他のuseEffectが完了した後）
      const timer = setTimeout(() => {
        onClearBeforeMaximize()
      }, 0)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isFullScreen, beforeMaximize])

  // 通常のtop/left変更時の位置更新（beforeMaximizeがない時のみ）
  useEffect(() => {
    // beforeMaximizeがある場合は上のuseEffectで処理するのでスキップ
    if (!isInitialized || isFullScreen || beforeMaximize !== undefined || rndRef.current === null) {
      return
    }

    // topまたはleftが変更された場合に位置を更新
    if (top !== undefined || left !== undefined) {
      const draggableState = rndRef.current.draggable?.state as
        | Pick<SizeLocationInfo, "x" | "y">
        | undefined
      const newPosition = {
        x: left ?? draggableState?.x ?? 0,
        y: top ?? draggableState?.y ?? 0
      }
      rndRef.current.updatePosition(newPosition)
    }
  }, [isInitialized, isFullScreen, top, left, beforeMaximize])

  // isFullScreenの場合はRndを使わない
  if (isFullScreen) {
    return (
      <div
        className={clsx(
          styles.windowContainer,
          styles.FullScreen,
          shouldAppear ? styles.AppearShown : styles.AppearHidden
        )}
        style={{ pointerEvents: shouldAppear ? "auto" : "none" }}
      >
        {windowControlProps.hasWindowControl === true && (
          <div className={styles.control}>
            <WindowControl
              onClose={windowControlProps.onClose}
              onMaximize={handleMaximizeClick}
              onMinimize={windowControlProps.onMinimize}
            />
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
        height: "auto",
        width: "auto",
        x: 0,
        y: 0
      }}
      disableDragging={!isInitialized || isFixed}
      enableResizing={!isFixed}
      minHeight={initialSize.height ?? "auto"}
      minWidth={initialSize.width ?? "auto"}
      onDrag={(_, data) => {
        handlePositionChange?.({ x: data.x, y: data.y })
      }}
      onResize={(_, __, ref) => {
        // リサイズ時に現在のサイズを保存
        setCurrentSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight
        })
      }}
      size={currentSize}
      style={{
        visibility: isInitialized ? "visible" : "hidden",
        zIndex: zIndex ?? "auto",
        pointerEvents: shouldAppear ? "auto" : "none"
      }}
    >
      <div
        ref={windowContentRef}
        className={clsx(
          styles.windowContainer,
          isFullScreen && styles.FullScreen,
          shouldAppear ? styles.AppearShown : styles.AppearHidden
        )}
        onClick={onFocus}
        onMouseDown={onFocus}
      >
        {windowControlProps.hasWindowControl === true && (
          <div className={styles.control}>
            <WindowControl
              onClose={windowControlProps.onClose}
              onMaximize={handleMaximizeClick}
              onMinimize={windowControlProps.onMinimize}
            />
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </Rnd>
  )
}
