import clsx from "clsx"
import { useAtomValue } from "jotai"

import styles from "@/components/windows/PlayerWindow/index.module.css"
import { NextTrackIcon } from "@/components/windows/PlayerWindow/NextTrackIcon"
import { PauseIcon } from "@/components/windows/PlayerWindow/PauseIcon"
import { PlayIcon } from "@/components/windows/PlayerWindow/PlayIcon"
import {
  currentTrackAtom,
  audioControlsAtom,
  audioIsPlayingAtom,
  playbackProgressAtom,
  currentTrackThemeColorAtom
} from "@/stores/audioAtoms"

/** プレイヤーウィンドウ */
export const PlayerWindow = () => {
  const trackInfo = useAtomValue(currentTrackAtom)
  const progressPercent = useAtomValue(playbackProgressAtom)
  const audioControls = useAtomValue(audioControlsAtom)
  const isPlaying = useAtomValue(audioIsPlayingAtom)
  const themeColor = useAtomValue(currentTrackThemeColorAtom)

  return (
    <div className={styles.playerWindow}>
      <div className={styles.artwork} style={{ backgroundColor: themeColor }}>
        <img className={styles.image} src={trackInfo?.artwork} />
      </div>

      <div className={styles.meta}>
        <div className={styles.texts}>
          <span className={clsx(styles.title, styles.maxOneLine)}>{trackInfo?.title}</span>
          <span className={clsx(styles.artists, styles.maxOneLine)}>
            {`/ ${trackInfo?.artists.join(", ")}`}
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.actions}>
            <button
              className={clsx(styles.item, isPlaying ? styles.Pause : styles.Play)}
              onClick={() => (isPlaying ? audioControls?.pause() : audioControls?.play())}
              type="button"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              className={clsx(styles.item, styles.NextTrack)}
              onClick={() => audioControls?.next()}
              type="button"
            >
              <NextTrackIcon />
            </button>
          </div>

          <div className={styles.seekbar}>
            <div className={styles.current} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
