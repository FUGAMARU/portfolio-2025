import { GeneralButton } from "@/components/parts/button/GeneralButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { ComponentProps } from "react"

import styles from "@/components/windows/WorkDetailWindow/index.module.css"

/** Props */
type Props = {
  /** 開いているかどうか */
  isOpen: boolean
} & Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMaximize" | "onMinimize"> &
  Pick<ComponentProps<typeof WindowContainer>, "left" | "top">

/** 作品詳細ウィンドウ TODO: 仮あて */
export const WorkDetailWindow = ({ isOpen, ...windowContainerProps }: Props) => {
  if (!isOpen) {
    return null
  }

  return (
    <WindowContainer hasWindowControl isFullScreen={false} {...windowContainerProps}>
      <div className={styles.workDetailWindow}>
        <p>作品情報をこのウィンドウで表示します</p>
        <GeneralButton href="/" text="作品詳細ページへ" />
      </div>
    </WindowContainer>
  )
}
