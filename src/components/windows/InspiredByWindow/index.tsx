import { useRef } from "react"

import { InspiredSourceLinkButton } from "@/components/parts/button/InspiredSourceLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import styles from "@/components/windows/InspiredByWindow/index.module.css"
import { useWindowScale } from "@/hooks/useWindowScale"

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
  const windowScale = useWindowScale(rootRef)

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
