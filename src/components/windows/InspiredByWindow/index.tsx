import { WindowContainer } from "@/components/parts/window/WindowContainer"
import styles from "@/components/windows/InspiredByWindow/index.module.css"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { ComponentProps } from "react"

/** Props */
type Props = Pick<
  ComponentProps<typeof WindowContainer>,
  "left" | "top" | "zIndex" | "onPositionChange" | "onFocus"
> &
  Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMinimize" | "onMaximize">

/** InspiredByウィンドウ */
export const InspiredByWindow = ({ ...windowContainerProps }: Props) => {
  return (
    <WindowContainer
      hasWindowControl
      isFixed={false}
      isFullScreen={false}
      {...windowContainerProps}
    >
      <div className={styles.inspiredByWindow}>
        <p className={styles.title}>This portfolio was inspired by …</p>
      </div>
    </WindowContainer>
  )
}
