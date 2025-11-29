import clsx from "clsx"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { WorkLinkButton } from "@/components/parts/button/WorkLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import styles from "@/components/windows/WorkDetailWindow/index.module.css"
import { useWindowScale } from "@/hooks/useWindowScale"
import { getResourceUrl } from "@/utils"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { Work } from "@/hooks/useDataFetch"
import type { SizeLocationInfo } from "@/types"
import type { ComponentProps } from "react"

// 拡張係数: Window高さ増分のうち本文拡張に割り当てる割合
const GROW_FACTOR = 0.7
// 初期表示での説明文最大高さ (rem単位基準値)
const INITIAL_DESCRIPTION_MAX_REM = 7.25

/** Props */
type Props = Work &
  Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMaximize" | "onMinimize"> &
  Pick<
    ComponentProps<typeof WindowContainer>,
    "left" | "top" | "onPositionChange" | "zIndex" | "onFocus" | "isFullScreen" | "beforeMaximize"
  > & {
    /** 最大化前状態をクリアするコールバック */
    onClearBeforeMaximize?: () => void
  }

/** 作品詳細ウィンドウ */
export const WorkDetailWindow = ({
  zIndex,
  onFocus,
  description,
  thumbnail,
  logo,
  tags,
  referenceLinks,
  ...windowContainerProps
}: Props) => {
  const initialMaxHeightRef = useRef<number>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const windowScale = useWindowScale(rootRef, windowContainerProps.isFullScreen)
  const [dynamicMaxHeight, setDynamicMaxHeight] = useState<number>()
  /** カスタムスクロールバーの状態 */
  const [scrollbarState, setScrollbarState] = useState<
    {
      /** 非表示かどうか */
      isHidden: boolean
    } & Pick<SizeLocationInfo, "height"> & {
        /** Y方向変位 */
        translateY: number
      }
  >({ isHidden: true, height: 0, translateY: 0 })

  // WindowContainerの高さ変化に応じて説明文のmax-heightを拡張
  useLayoutEffect(() => {
    const rootElement = rootRef.current
    if (rootElement === null) {
      return
    }

    const windowElement = rootElement.parentElement
    if (windowElement === null) {
      return
    }

    let baseHeight: number | undefined
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect

      if (baseHeight === undefined) {
        baseHeight = height
        // 初期maxHeightを実測で取得（CSSのremやフォントロード後の値に追従）
        if (initialMaxHeightRef.current === null) {
          const descEl = descriptionRef.current
          if (descEl !== null) {
            initialMaxHeightRef.current = descEl.clientHeight
          }
        }
      }

      if (baseHeight !== undefined) {
        const INITIAL_MAX = initialMaxHeightRef.current ?? INITIAL_DESCRIPTION_MAX_REM * 16 // 1rem = 16px
        const extra = Math.max(0, height - baseHeight)
        const target = INITIAL_MAX + extra * GROW_FACTOR
        setDynamicMaxHeight(target)
      }
    })

    resizeObserver.observe(windowElement)

    return () => resizeObserver.disconnect()
  }, [])

  // macOSなどではオーバーレイスクロールバーが採用されており、ユーザーのシステム設定やOSの挙動により未操作時は非表示になる。
  // 今回はカスタムスクロールバーを常時表示させたいので、独自のトラック/サムを描写し、サムの位置やサイズを同期させるためにuseEffectでDOM計測とイベント購読を実装している。
  useEffect(() => {
    const description = descriptionRef.current
    if (description === null) {
      return
    }

    let rafId: number | undefined
    const MIN_THUMB_HEIGHT = 24

    /** スクロール量と内容サイズからthumb状態を再計算 */
    const compute = () => {
      const visibleHeight = description.clientHeight
      const totalHeight = description.scrollHeight
      const scrollTop = description.scrollTop
      if (visibleHeight <= 0 || totalHeight <= 0) {
        setScrollbarState({ isHidden: true, height: 0, translateY: 0 })
        return
      }

      const contentScrollable = totalHeight > visibleHeight
      if (!contentScrollable) {
        setScrollbarState({ isHidden: true, height: 0, translateY: 0 })
        return
      }

      if (trackRef.current !== null) {
        trackRef.current.style.height = `${visibleHeight}px`
      }
      const height = Math.max((visibleHeight / totalHeight) * visibleHeight, MIN_THUMB_HEIGHT)
      const maxTop = Math.max(visibleHeight - height, 0)
      const progress = scrollTop / Math.max(totalHeight - visibleHeight, 1)
      const translateY = maxTop * progress
      setScrollbarState({ isHidden: false, height, translateY })
    }

    /** 連続スクロール時の再計算を1フレーム1回に制限 */
    const schedule = () => {
      if (rafId !== undefined) {
        return
      }

      rafId = requestAnimationFrame(() => {
        rafId = undefined
        compute()
      })
    }

    description.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)

    let resizeObserver: ResizeObserver | undefined
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(compute)
      resizeObserver.observe(description)
    }

    return () => {
      description.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)

      if (rafId !== undefined) {
        cancelAnimationFrame(rafId)
      }

      resizeObserver?.disconnect()
    }
  }, [])

  // 初期thumb計算をレイアウト確定後に一度だけ実行
  useLayoutEffect(() => {
    const description = descriptionRef.current
    if (description === null) {
      return
    }

    // 初期thumb計算は次フレームで実行し同期的な再レンダーを避ける
    requestAnimationFrame(() => {
      const visibleHeight = description.clientHeight
      const totalHeight = description.scrollHeight
      if (visibleHeight <= 0 || totalHeight <= 0 || totalHeight <= visibleHeight) {
        setScrollbarState({ isHidden: true, height: 0, translateY: 0 })
        return
      }

      const MIN_THUMB_HEIGHT = 24
      // 初期計算時もトラック高さを同期
      if (trackRef.current !== null) {
        trackRef.current.style.height = `${visibleHeight}px`
      }

      const height = Math.max((visibleHeight / totalHeight) * visibleHeight, MIN_THUMB_HEIGHT)
      setScrollbarState({ isHidden: false, height, translateY: 0 })
    })
  }, [])

  return (
    <WindowContainer
      hasWindowControl
      isFixed={false}
      onFocus={onFocus}
      zIndex={zIndex}
      {...windowContainerProps}
    >
      <div
        ref={rootRef}
        className={styles.workDetailWindow}
        style={{ ["--window-scale" as string]: windowScale }}
      >
        <div className={styles.preview}>
          <img className={styles.thumbnail} src={getResourceUrl(thumbnail)} />
        </div>
        <div className={styles.info}>
          <img className={styles.logo} src={getResourceUrl(logo)} />

          <div className={styles.tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.content}>
            <p
              ref={descriptionRef}
              className={styles.description}
              style={
                dynamicMaxHeight !== undefined
                  ? { maxHeight: `${Math.round(dynamicMaxHeight)}px` }
                  : undefined
              }
            >
              {description}
            </p>
            <div ref={trackRef} className={styles.scrollbar}>
              <div
                ref={thumbRef}
                className={clsx(styles.thumb, { [styles.Hidden]: scrollbarState.isHidden })}
                style={
                  scrollbarState.isHidden
                    ? undefined
                    : {
                        height: `${Math.round(scrollbarState.height)}px`,
                        transform: `translateY(${Math.round(scrollbarState.translateY)}px)`
                      }
                }
              />
            </div>
          </div>

          <div className={styles.links}>
            {referenceLinks.map(link => (
              <WorkLinkButton key={link.href} href={link.href} text={link.text} />
            ))}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
