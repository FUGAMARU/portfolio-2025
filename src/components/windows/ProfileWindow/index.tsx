import clsx from "clsx"
import { useRef, useState } from "react"

import { BadgeLinkButton } from "@/components/parts/button/BadgeLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { CakeIcon } from "@/components/windows/ProfileWindow/CakeIcon"
import styles from "@/components/windows/ProfileWindow/index.module.css"
import { WrenchIcon } from "@/components/windows/ProfileWindow/WrenchIcon"
import { useWindowScale } from "@/hooks/useWindowScale"
import { getResourceUrl } from "@/utils"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { Profile } from "@/hooks/useDataFetch"
import type { SizeLocationInfo } from "@/types"
import type { ComponentProps } from "react"

/** Props */
type Props = {
  /** プロフィール */
  profile: Profile
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
  | "beforeMaximize"
> &
  Partial<ComponentProps<typeof WindowControl>> & {
    /** 最大化前状態をクリアするコールバック */
    onClearBeforeMaximize?: () => void
  }

/** プロフィールウィンドウ */
export const ProfileWindow = ({
  profile,
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
  shouldAppear,
  beforeMaximize,
  onClearBeforeMaximize
}: Props) => {
  const [shouldDisplay, setShouldDisplay] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const windowScale = useWindowScale(containerRef, externalIsFullScreen ?? isFullScreen)

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
  const handleMaximizeButtonClick = (info?: SizeLocationInfo) => {
    if (handleMaximize !== undefined) {
      handleMaximize(info)
      return
    }
    setIsFullScreen(prev => !prev)
  }

  return (
    <WindowContainer
      beforeMaximize={beforeMaximize}
      bottom={bottom}
      hasWindowControl
      isFixed={false}
      isFullScreen={actualIsFullScreen}
      left={left}
      onClearBeforeMaximize={onClearBeforeMaximize}
      onClose={handleCloseButtonClick}
      onFocus={onFocus}
      onMaximize={handleMaximizeButtonClick}
      onMinimize={handleMinimizeButtonClick}
      onPositionChange={onPositionChange}
      shouldAppear={shouldAppear}
      top={top}
      zIndex={zIndex}
    >
      <div
        ref={containerRef}
        className={styles.profileWindow}
        style={{ ["--window-scale" as string]: windowScale }}
      >
        <h1 className={styles.name}>{profile.name}</h1>

        <div className={styles.info}>
          <div className={styles.row}>
            <span className={styles.icon}>
              <WrenchIcon />
            </span>
            <span className={styles.label}>{profile.title}</span>
          </div>

          <div className={styles.row}>
            <span className={styles.icon}>
              <CakeIcon />
            </span>
            <span className={clsx(styles.label, styles.Numeric)}>{profile.birthday}</span>
          </div>
        </div>

        <div className={styles.badges}>
          <div className={styles.row}>
            {profile.badges.upper.map(badge => (
              <BadgeLinkButton
                key={badge.src}
                height={badge.height}
                href={badge.href}
                src={getResourceUrl(badge.src)}
              />
            ))}
          </div>
          <div className={styles.row}>
            {profile.badges.lower.map(badge => (
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
