import { SoundActionButton } from "@/components/parts/button/SoundActionButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { DiscIcon } from "@/components/views/WelcomeView/DiscIcon"
import styles from "@/components/views/WelcomeView/index.module.css"

import type { Dispatch, SetStateAction } from "react"

/** Props */
type Props = {
  /** setIsMuted */
  setIsMuted: Dispatch<SetStateAction<boolean | undefined>>
  /** フェードアウト中かどうか */
  isTransitioning?: boolean
}

/** 初期表示ビュー */
export const WelcomeView = ({ setIsMuted, isTransitioning = false }: Props) => {
  return (
    <WindowContainer
      className={isTransitioning ? styles.fadeOut : undefined}
      hasWindowControl={false}
      isFixed
      isFullScreen={false}
    >
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
          {/* ボタンクリックしたらプログレスバー表示するなりしたい */}
          <SoundActionButton displayType="on" onClick={() => setIsMuted(false)} />
          <SoundActionButton displayType="off" onClick={() => setIsMuted(true)} />
        </div>
      </div>
    </WindowContainer>
  )
}
