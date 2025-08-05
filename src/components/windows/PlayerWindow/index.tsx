import clsx from "clsx"
import { useAtomValue } from "jotai"

import styles from "@/components/windows/PlayerWindow/index.module.css"
import { NextTrackIcon } from "@/components/windows/PlayerWindow/NextTrackIcon"
import { PauseIcon } from "@/components/windows/PlayerWindow/PauseIcon"
import { audioAtom } from "@/stores/audioAtoms"

/** プレイヤーウィンドウ */
export const PlayerWindow = () => {
  const audio = useAtomValue(audioAtom)

  return (
    <div className={styles.playerWindow}>
      <div className={styles.artwork}>
        <img className={styles.image} src={audio?.artwork} />
      </div>

      <div className={styles.meta}>
        <div className={styles.texts}>
          <span className={clsx(styles.title, styles.MaxOneLine)}>{audio?.title}</span>
          <span className={clsx(styles.artists, styles.MaxOneLine)}>
            {`/ ${audio?.artists.join(", ")}`}
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
