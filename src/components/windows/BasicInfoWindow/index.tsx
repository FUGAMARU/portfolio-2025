import clsx from "clsx"
import { useState } from "react"

import { BadgeLinkButton } from "@/components/parts/button/BadgeLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { CakeIcon } from "@/components/windows/BasicInfoWindow/CakeIcon"
import styles from "@/components/windows/BasicInfoWindow/index.module.css"
import { WrenchIcon } from "@/components/windows/BasicInfoWindow/WrenchIcon"
import { getResourceUrl } from "@/utils"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { PortfolioData } from "@/hooks/useDataFetch"
import type { ComponentProps } from "react"

/** Props */
type Props = {
  /** 基本情報 */
  basicInfo: PortfolioData["basicInfo"]
} & Pick<
  ComponentProps<typeof WindowContainer>,
  | "left"
  | "bottom"
  | "top"
  | "zIndex"
  | "isFullScreen"
  | "onFocus"
  | "onPositionChange"
  | "shouldAppear"
> &
  Partial<ComponentProps<typeof WindowControl>>

/** 基本情報ウィンドウ */
export const BasicInfoWindow = ({
  basicInfo,
  left,
  bottom,
  top,
  zIndex,
  isFullScreen: externalIsFullScreen,
  onClose: handleClose,
  onMinimize: handleMinimize,
  onMaximize: handleMaximize,
  onFocus,
  onPositionChange,
  shouldAppear
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
      isFixed={false}
      isFullScreen={actualIsFullScreen}
      left={left}
      onClose={handleCloseButtonClick}
      onFocus={onFocus}
      onMaximize={handleMaximizeButtonClick}
      onMinimize={handleMinimizeButtonClick}
      onPositionChange={onPositionChange}
      shouldAppear={shouldAppear}
      top={top}
      zIndex={zIndex}
    >
      <div className={styles.basicInfoWindow}>
        <h1 className={styles.name}>{basicInfo.name}</h1>

        <div className={styles.info}>
          <div className={styles.row}>
            <span className={styles.icon}>
              <WrenchIcon />
            </span>
            <span className={styles.label}>{basicInfo.title}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>
              <CakeIcon />
            </span>
            <span className={clsx(styles.label, styles.Numeric)}>{basicInfo.birthday}</span>
          </div>
        </div>

        <div className={styles.badges}>
          <div className={styles.row}>
            {basicInfo.badges.upper.map(badge => (
              <BadgeLinkButton
                key={badge.src}
                height={badge.height}
                href={badge.href}
                src={getResourceUrl(badge.src)}
              />
            ))}
          </div>
          <div className={styles.row}>
            {basicInfo.badges.lower.map(badge => (
              <BadgeLinkButton
                key={badge.src}
                height={badge.height}
                href={badge.href}
                src={getResourceUrl(badge.src)}
              />
            ))}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
