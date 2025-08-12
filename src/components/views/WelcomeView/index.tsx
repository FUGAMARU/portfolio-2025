import { SoundActionButton } from "@/components/parts/button/SoundActionButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { DiscIcon } from "@/components/views/WelcomeView/DiscIcon"
import styles from "@/components/views/WelcomeView/index.module.css"

import type { Dispatch, SetStateAction } from "react"

/** Props */
type Props = {
  /** setIsMuted */
  setIsMuted: Dispatch<SetStateAction<boolean | undefined>>
  /** Playボタン押下時に実行（再生開始処理を委譲） */
  onPlayClick?: () => void
  /** Playボタンがスピナー表示かどうか */
  isPlayButtonShowsSpinner?: boolean
}

/** 初期表示ビュー */
export const WelcomeView = ({
  setIsMuted,
  onPlayClick,
  isPlayButtonShowsSpinner = false
}: Props) => {
  return (
    <WindowContainer hasWindowControl={false} isFixed isFullScreen={false}>
      <div className={styles.welcomeView}>
        <div className={styles.upper}>
          <span className={styles.icon}>
            <DiscIcon />
          </span>
          <p className={styles.title}>
            BGMをオンにして
            <br />
            FUGAMARU.COMの世界観をお楽しみください
          </p>
          <p className={styles.caption}>Enjoy the atmosphere with BGM</p>
        </div>

        <div className={styles.actions}>
          <SoundActionButton
            displayType="on"
            onClick={() => (onPlayClick !== undefined ? onPlayClick() : setIsMuted(false))}
            shouldShowSpinner={isPlayButtonShowsSpinner}
          />
          <SoundActionButton displayType="off" onClick={() => setIsMuted(true)} />
        </div>
      </div>
    </WindowContainer>
  )
}
