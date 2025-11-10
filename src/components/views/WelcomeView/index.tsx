import clsx from "clsx"
import { useEffect, useRef, useState } from "react"

import { SoundActionButton } from "@/components/parts/button/SoundActionButton"
import { ProgressBar } from "@/components/parts/ProgressBar"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import { DiscIcon } from "@/components/views/WelcomeView/DiscIcon"
import styles from "@/components/views/WelcomeView/index.module.css"

import type { Dispatch, SetStateAction } from "react"

/** フェードアウトアニメーションのDuration (ms) */
const FADE_OUT_DURATION_MS = 1000

/** Props */
type Props = {
  /** メディアロード中か */
  isMediaLoading: boolean
  /** メディアの読み込みの進捗（0-100%） */
  mediaProgressPercent: number
  /** setIsMuted */
  setIsMuted: Dispatch<SetStateAction<boolean | undefined>>
  /** Playボタン押下時に実行（再生開始処理を委譲） */
  onPlayClick?: () => void
  /** Playボタンがスピナー表示かどうか */
  isPlayButtonShowsSpinner?: boolean
}

/** 初期表示ビュー */
export const WelcomeView = ({
  isMediaLoading,
  isPlayButtonShowsSpinner,
  mediaProgressPercent,
  onPlayClick,
  setIsMuted
}: Props) => {
  const [transitionPhase, setTransitionPhase] = useState<
    "loading" | "crossfade" | "actions-visible"
  >(isMediaLoading ? "loading" : "actions-visible")
  const timeoutRef = useRef<number>(null)

  // フェードアニメーションの制御
  useEffect(() => {
    if (!isMediaLoading) {
      requestAnimationFrame(() => {
        setTransitionPhase("crossfade")
        timeoutRef.current = window.setTimeout(() => {
          setTransitionPhase("actions-visible")
        }, FADE_OUT_DURATION_MS)
      })
      return
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    requestAnimationFrame(() => {
      setTransitionPhase("loading")
    })

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isMediaLoading])

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

        <div className={styles.lower}>
          <div className={styles.inner}>
            {(transitionPhase === "loading" || transitionPhase === "crossfade") && (
              <div
                className={clsx(
                  styles.layer,
                  styles.fetching,
                  transitionPhase === "crossfade" && styles.Hidden
                )}
              >
                <ProgressBar hasEasing progress={mediaProgressPercent} />
                <span className={styles.label}>
                  リソースを読み込み中… ({(mediaProgressPercent ?? 0).toFixed(1)}%)
                </span>
              </div>
            )}
            {(transitionPhase === "crossfade" || transitionPhase === "actions-visible") && (
              <div
                className={clsx(
                  styles.layer,
                  styles.actions,
                  transitionPhase === "actions-visible" && styles.Visible
                )}
              >
                <SoundActionButton
                  displayType="on"
                  onClick={() => (onPlayClick !== undefined ? onPlayClick() : setIsMuted(false))}
                  shouldShowSpinner={isPlayButtonShowsSpinner}
                />
                <SoundActionButton displayType="off" onClick={() => setIsMuted(true)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
