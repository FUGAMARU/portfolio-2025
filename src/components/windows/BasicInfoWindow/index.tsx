import { useState } from "react"

import { BadgeLinkButton } from "@/components/parts/button/BadgeLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import styles from "@/components/windows/BasicInfoWindow/index.module.css"

/** 基本情報ウィンドウ */
export const BasicInfoWindow = () => {
  const [shouldDisplay, setShouldDisplay] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)

  /** 閉じるボタンを押下した時の処理 */
  const handleCloseButtonClick = () => {
    setShouldDisplay(false)
  }

  /** 最小化ボタンを押下した時の処理 */
  const handleMinimizeButtonClick = () => {
    // TODO: 挙動は要検討
    setShouldDisplay(false)
  }

  /** 最大化ボタンを押下した時の処理 */
  const handleMaximizeButtonClick = () => {
    // TODO: アニメーション付けたい
    setIsFullScreen(prev => !prev)
  }

  if (!shouldDisplay) {
    return null
  }

  return (
    <WindowContainer
      hasWindowControl
      isFullScreen={isFullScreen}
      onClose={handleCloseButtonClick}
      onMaximize={handleMaximizeButtonClick}
      onMinimize={handleMinimizeButtonClick}
    >
      <div className={styles.basicInfoWindow}>
        BasicInfoText
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
