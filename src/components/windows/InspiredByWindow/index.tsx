import { useLayoutEffect, useRef, useState } from "react"

import { InspiredSourceLinkButton } from "@/components/parts/button/InspiredSourceLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import windowContainerStyles from "@/components/parts/window/WindowContainer/index.module.css"
import styles from "@/components/windows/InspiredByWindow/index.module.css"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { ComponentProps } from "react"

/** Props */
type Props = Pick<
  ComponentProps<typeof WindowContainer>,
  "left" | "top" | "zIndex" | "onPositionChange" | "onFocus"
> &
  Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMinimize" | "onMaximize"> & {
    /** InspiredBy用データ */
    inspiredBy: Array<ComponentProps<typeof InspiredSourceLinkButton>>
  }

/** InspiredByウィンドウ */
export const InspiredByWindow = ({ inspiredBy, ...windowContainerProps }: Props) => {
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
      }

      if (baseWidth > 0) {
        const nextScale = Math.max(1, width / baseWidth)
        setWindowScale(nextScale)
      }
    })
    resizeObserver.observe(windowElement)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <WindowContainer
      hasWindowControl
      isFixed={false}
      isFullScreen={false}
      {...windowContainerProps}
    >
      <div
        ref={rootRef}
        className={styles.inspiredByWindow}
        style={{ ["--window-scale" as string]: windowScale }}
      >
        <p className={styles.title}>This portfolio was inspired by …</p>
        <ul className={styles.items}>
          {inspiredBy.map(item => (
            <li key={item.href}>
              <InspiredSourceLinkButton
                href={item.href}
                icon={item.icon}
                label={item.label}
                type={item.type}
              />
            </li>
          ))}
        </ul>
      </div>
    </WindowContainer>
  )
}
