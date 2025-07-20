import clsx from "clsx"
import { useState } from "react"

import { BadgeLinkButton } from "@/components/parts/button/BadgeLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { CakeIcon } from "@/components/windows/BasicInfoWindow/CakeIcon"
import styles from "@/components/windows/BasicInfoWindow/index.module.css"
import { WrenchIcon } from "@/components/windows/BasicInfoWindow/WrenchIcon"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { ComponentProps } from "react"

/** Props */
type Props = Pick<
  ComponentProps<typeof WindowContainer>,
  "left" | "bottom" | "top" | "zIndex" | "isFullScreen" | "onFocus" | "onPositionChange"
> &
  Partial<ComponentProps<typeof WindowControl>>

/** 基本情報ウィンドウ */
export const BasicInfoWindow = ({
  left,
  bottom,
  top,
  zIndex,
  isFullScreen: externalIsFullScreen,
  onClose: handleClose,
  onMinimize: handleMinimize,
  onMaximize: handleMaximize,
  onFocus,
  onPositionChange
}: Props) => {
  const [shouldDisplay, setShouldDisplay] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)

  if (!shouldDisplay) {
    return null
  }

  // 外部からの制御がある場合はそれを優先
  const actualIsFullScreen = externalIsFullScreen ?? isFullScreen

  /** 閉じるボタンを押下した時の処理 */
  const handleCloseButtonClick = () => {
    if (handleClose !== undefined) {
      handleClose()
      return
    }
    setShouldDisplay(false)
  }

  /** 最小化ボタンを押下した時の処理 */
  const handleMinimizeButtonClick = () => {
    if (handleMinimize !== undefined) {
      handleMinimize()
      return
    }
    setShouldDisplay(false)
  }

  /** 最大化ボタンを押下した時の処理 */
  const handleMaximizeButtonClick = () => {
    if (handleMaximize !== undefined) {
      handleMaximize()
      return
    }
    setIsFullScreen(prev => !prev)
  }

  return (
    <WindowContainer
      bottom={bottom}
      hasWindowControl
      isFullScreen={actualIsFullScreen}
      left={left}
      onClose={handleCloseButtonClick}
      onFocus={onFocus}
      onMaximize={handleMaximizeButtonClick}
      onMinimize={handleMinimizeButtonClick}
      onPositionChange={onPositionChange}
      top={top}
      zIndex={zIndex}
    >
      <div className={styles.basicInfoWindow}>
        <h1 className={styles.name}>YAMADA Taro</h1>

        <div className={styles.info}>
          <div className={styles.row}>
            <span className={styles.icon}>
              <WrenchIcon />
            </span>
            <span className={styles.label}>Frontend Engineer — hogePoyo Inc. (Tokyo)</span>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>
              <CakeIcon />
            </span>
            <span className={clsx(styles.label, styles.Numeric)}>2002/05/04</span>
          </div>
        </div>

        <div className={styles.badges}>
          <div className={styles.row}>
            <BadgeLinkButton
              alt="alt"
              height={20}
              href="https://google.com"
              src="https://placehold.jp/980x200.png"
            />
          </div>
          <div className={styles.row}>
            <BadgeLinkButton
              alt="alt"
              height={20}
              href="https://google.com"
              src="https://placehold.jp/980x200.png"
            />
            <BadgeLinkButton
              alt="alt"
              height={20}
              href="https://google.com"
              src="https://placehold.jp/980x200.png"
            />
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
