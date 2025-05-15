import clsx from "clsx"

import styles from "@/components/parts/window/WindowContainer/index.module.css"
import { WindowControl } from "@/components/parts/window/WindowControl"

import type { ComponentProps, ReactNode } from "react"

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
type Props = (PropsWithWindowControl | PropsWithoutWindowControl) & {
  /** Children */
  children: ReactNode
  /** フルスクリーン表示するかどうか */
  isFullScreen: boolean
}

/** ウィンドウコンテナ */
export const WindowContainer = ({ children, isFullScreen, ...windowControlProps }: Props) => {
  return (
    <div className={clsx(styles.windowContainer, isFullScreen && styles.FullScreen)}>
      {windowControlProps.hasWindowControl === true && (
        <div className={styles.control}>
          <WindowControl {...windowControlProps} />
        </div>
      )}
      {children}
    </div>
  )
}
