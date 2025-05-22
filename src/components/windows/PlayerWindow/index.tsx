import clsx from "clsx"

import styles from "@/components/windows/PlayerWindow/index.module.css"
import { NextTrackIcon } from "@/components/windows/PlayerWindow/NextTrackIcon"
import { PauseIcon } from "@/components/windows/PlayerWindow/PauseIcon"

/** プレイヤーウィンドウ */
export const PlayerWindow = () => {
  return (
    <div className={styles.playerWindow}>
      <div className={styles.artwork}>
        <img
          className={styles.image}
          src="https://i.scdn.co/image/ab67616d0000b273ebbee820a0fefe02ee245426"
        />
      </div>

      <div className={styles.meta}>
        <div className={styles.texts}>
          <span className={clsx(styles.title, styles.MaxOneLine)}>full of spells (feat. Such)</span>
          <span className={clsx(styles.artists, styles.MaxOneLine)}>
            / MOTTO MUSIC, kamome sano, Such
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.actions}>
            <button className={clsx(styles.item, styles.Pause)} type="button">
              <PauseIcon />
            </button>
            <button className={styles.item} type="button">
              <NextTrackIcon />
            </button>
          </div>

          <div className={styles.seekbar}>
            <div className={styles.current} style={{ width: "50%" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
