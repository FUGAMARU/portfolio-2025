import { animate } from "animejs"
import clsx from "clsx"
import { useAtomValue } from "jotai"
import { useRef } from "react"

import { ProgressBar } from "@/components/parts/ProgressBar"
import { CloseIcon } from "@/components/windows/PlayerWindow/CloseIcon"
import styles from "@/components/windows/PlayerWindow/index.module.css"
import { NextTrackIcon } from "@/components/windows/PlayerWindow/NextTrackIcon"
import { PauseIcon } from "@/components/windows/PlayerWindow/PauseIcon"
import { PlayIcon } from "@/components/windows/PlayerWindow/PlayIcon"
import {
  currentTrackAtom,
  audioControlsAtom,
  isAudioPlayingAtom,
  playbackProgressAtom,
  currentTrackThemeColorAtom
} from "@/stores/audioAtoms"

/** スライドアウト時のオフセット (閉じるボタンがPlayerWindowの左側にはみ出しているので若干オフセットを効かせている) */
const SLIDE_OFFSET_PX = 20
/** スライドアウト時のDuration */
const SLIDE_DURATION_MS = 500

/** プレイヤーウィンドウ */
export const PlayerWindow = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackInfo = useAtomValue(currentTrackAtom)
  const progressPercent = useAtomValue(playbackProgressAtom)
  const audioControls = useAtomValue(audioControlsAtom)
  const isPlaying = useAtomValue(isAudioPlayingAtom)
  const themeColor = useAtomValue(currentTrackThemeColorAtom)

  /**
   * 閉じるボタン押下時の処理
   * - 再生を一時停止
   * - 右方向へスライドして画面外へ
   * - アニメーション完了後に非表示
   */
  const handleClose = (): void => {
    audioControls?.pause()

    const element = containerRef.current
    if (element === null) {
      return
    }

    const { width } = element.getBoundingClientRect()
    const distance = width + SLIDE_OFFSET_PX
    animate(element, {
      translateX: [0, distance],
      duration: SLIDE_DURATION_MS,
      easing: "easeOutQuart"
    })
  }

  return (
    <div ref={containerRef} className={styles.playerWindow}>
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
          <ProgressBar progress={progressPercent} />
        </div>
      </div>

      <button className={styles.close} onClick={handleClose} type="button">
        <span className={styles.icon}>
          <CloseIcon />
        </span>
      </button>
    </div>
  )
}
