import clsx from "clsx"
import { useState } from "react"

import { BadgeLinkButton } from "@/components/parts/button/BadgeLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { CakeIcon } from "@/components/windows/BasicInfoWindow/CakeIcon"
import styles from "@/components/windows/BasicInfoWindow/index.module.css"
import { WrenchIcon } from "@/components/windows/BasicInfoWindow/WrenchIcon"

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
