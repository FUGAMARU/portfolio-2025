import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { WorkLinkButton } from "@/components/parts/button/WorkLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import windowContainerStyles from "@/components/parts/window/WindowContainer/index.module.css"
import styles from "@/components/windows/WorkDetailWindow/index.module.css"
import { getResourceUrl } from "@/utils"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { Work } from "@/hooks/useDataFetch"
import type { ComponentProps } from "react"

/** Props */
type Props = Work &
  Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMaximize" | "onMinimize"> &
  Pick<
    ComponentProps<typeof WindowContainer>,
    "left" | "top" | "onPositionChange" | "zIndex" | "onFocus"
  >

/** 作品詳細ウィンドウ */
export const WorkDetailWindow = ({
  zIndex,
  onFocus,
  description,
  previewImage,
  logoImage,
  tags,
  referenceLinks,
  ...windowContainerProps
}: Props) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [windowScale, setWindowScale] = useState(1)

  // WindowContainerの幅を基準に要素をスケール
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
        return
      }
      if (baseWidth > 0) {
        setWindowScale(Math.max(1, width / baseWidth))
      }
    })
    resizeObserver.observe(windowElement)

    return () => resizeObserver.disconnect()
  }, [])

  // macOSなどではオーバーレイスクロールバーが採用されており、ユーザーのシステム設定やOSの挙動により未操作時は非表示になる。
  // 今回はカスタムスクロールバーを常時表示させたいので、独自のトラック/サムを描写し、サムの位置やサイズを同期させるためにuseEffectでDOM計測とイベント購読を実装している。
  useEffect(() => {
    const descriptionElement = descriptionRef.current
    const thumbElement = thumbRef.current
    if (descriptionElement === null || thumbElement === null) {
      return
    }

    /** スクロール位置と内容の高さに応じて、カスタムスクロールバーのサムを更新する */
    const updateThumb = () => {
      const visibleHeight = descriptionElement.clientHeight
      const totalHeight = descriptionElement.scrollHeight
      const scrollTop = descriptionElement.scrollTop

      if (totalHeight <= 0 || visibleHeight <= 0) {
        return
      }

      const contentScrollable = totalHeight > visibleHeight
      const minThumbHeight = 24
      const calculatedThumbHeight = contentScrollable
        ? Math.max((visibleHeight / totalHeight) * visibleHeight, minThumbHeight)
        : visibleHeight

      const maxThumbTop = Math.max(visibleHeight - calculatedThumbHeight, 0)
      const scrollProgress = contentScrollable
        ? scrollTop / Math.max(totalHeight - visibleHeight, 1)
        : 0
      const thumbTop = maxThumbTop * scrollProgress

      thumbElement.style.height = `${calculatedThumbHeight}px`
      thumbElement.style.transform = `translateY(${thumbTop}px)`
    }

    updateThumb()
    descriptionElement.addEventListener("scroll", updateThumb, { passive: true })
    window.addEventListener("resize", updateThumb)

    let resizeObserver: ResizeObserver | null = null
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updateThumb)
      resizeObserver.observe(descriptionElement)
    }

    return () => {
      descriptionElement.removeEventListener("scroll", updateThumb)
      window.removeEventListener("resize", updateThumb)
      if (resizeObserver !== null) {
        resizeObserver.disconnect()
      }
    }
  }, [description])

  return (
    <WindowContainer
      hasWindowControl
      isFixed={false}
      isFullScreen={false}
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
          <img className={styles.image} src={getResourceUrl(previewImage)} />
        </div>
        <div className={styles.info}>
          <img className={styles.logo} src={getResourceUrl(logoImage)} />

          <div className={styles.tags}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.content}>
            <p ref={descriptionRef} className={styles.description}>
              {description}
            </p>
            <div className={styles.scrollbar}>
              <div ref={thumbRef} className={styles.thumb} />
            </div>
          </div>

          <div className={styles.links}>
            {referenceLinks.map((link, index) => (
              <WorkLinkButton key={index} href={link.href} text={link.text} />
            ))}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
