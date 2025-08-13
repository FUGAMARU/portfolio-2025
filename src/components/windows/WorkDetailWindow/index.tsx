import { useEffect, useRef } from "react"

import { WorkLinkButton } from "@/components/parts/button/WorkLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
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
export const WorkDetailWindow = ({ zIndex, onFocus, ...windowContainerProps }: Props) => {
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const thumbRef = useRef<HTMLDivElement | null>(null)

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
      const trackHeight = visibleHeight

      if (totalHeight <= 0 || trackHeight <= 0) {
        return
      }

      const contentScrollable = totalHeight > visibleHeight
      const minThumbHeight = 24
      const calculatedThumbHeight = contentScrollable
        ? Math.max((visibleHeight / totalHeight) * trackHeight, minThumbHeight)
        : trackHeight

      const maxThumbTop = Math.max(trackHeight - calculatedThumbHeight, 0)
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
  }, [windowContainerProps.description])

  return (
    <WindowContainer
      hasWindowControl
      isFixed={false}
      isFullScreen={false}
      onFocus={onFocus}
      zIndex={zIndex}
      {...windowContainerProps}
    >
      <div className={styles.workDetailWindow}>
        <div className={styles.preview}>
          <img
            className={styles.image}
            src={getResourceUrl(windowContainerProps.previewImage)}
            width={500}
          />
        </div>
        <div className={styles.info}>
          <img
            className={styles.logo}
            height={70}
            src={getResourceUrl(windowContainerProps.logoImage)}
          />

          <div className={styles.tags}>
            {windowContainerProps.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className={styles.content}>
            <p ref={descriptionRef} className={styles.description}>
              {windowContainerProps.description}
            </p>
            <div className={styles.scrollbar}>
              <div ref={thumbRef} className={styles.thumb} />
            </div>
          </div>

          <div className={styles.links}>
            {windowContainerProps.referenceLinks.map((link, index) => (
              <WorkLinkButton key={index} href={link.href} text={link.text} />
            ))}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
