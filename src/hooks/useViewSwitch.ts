import { animate } from "animejs"
import { useCallback, useEffect, useRef, useState } from "react"

/** Welcomeフェードの所要時間(ms) */
const WELCOME_FADE_DURATION_MS = 800
/** Welcomeフェード（ミュート選択時）の開始遅延(ms) */
const WELCOME_MUTED_FADE_DELAY_MS = 300
/** Welcomeフェード（再生開始後）の開始遅延(ms) */
const WELCOME_STARTED_FADE_DELAY_MS = 0
/** Mainフェードの所要時間(ms) */
const MAIN_FADE_DURATION_MS = 600
/** 再生開始からWelcomeフェードまでの待機時間(ms) */
const STARTED_TO_FADE_DELAY_MS = 2000

/** Params */
type Params = {
  /** ミュート状態 */
  isMuted?: boolean
  /** ミュート切替 */
  setIsMuted: (value: boolean) => void
  /** 再生を開始する（親から注入される実処理） */
  startPlayback: () => void
  /** 再生進行度(0-100) */
  progressPercent: number
  /** 再生中フラグ */
  isPlaying: boolean
}

/** WelcomeViewとMainViewの切替およびアニメーションを管理するフック */
export const useViewSwitch = ({
  isMuted,
  setIsMuted,
  startPlayback,
  progressPercent,
  isPlaying
}: Params) => {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isPlayButtonShowsSpinner, setIsPlayButtonShowsSpinner] = useState(false)
  const [playStartedAtMs, setPlayStartedAtMs] = useState<number | null>(null)

  const welcomeRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const hasQueuedFadeRef = useRef(false)

  /** WelcomeViewのフェードアウト完了時に実行する処理 */
  const handleWelcomeFadeOutComplete = useCallback(() => {
    setShowWelcome(false)
  }, [])

  /** BGM再生開始後の待機を経たWelcomeViewフェードアウト完了時の処理 */
  const handleDelayedWelcomeFadeOutComplete = useCallback(() => {
    setShowWelcome(false)
    setIsPlayButtonShowsSpinner(false)
  }, [])

  /** Playボタン押下時の処理 */
  const onPlayClick = useCallback(() => {
    setIsMuted(false)
    setIsPlayButtonShowsSpinner(true)
    startPlayback()
  }, [startPlayback, setIsMuted])

  // ミュート選択時にWelcomeViewを即フェードアウトする副作用
  useEffect(() => {
    const isMutedOn = isMuted === true
    if (!isMutedOn || welcomeRef.current === null) {
      return
    }

    animate(welcomeRef.current, {
      opacity: [1, 0],
      duration: WELCOME_FADE_DURATION_MS,
      delay: WELCOME_MUTED_FADE_DELAY_MS,
      onComplete: handleWelcomeFadeOutComplete
    })
  }, [isMuted, handleWelcomeFadeOutComplete])

  // BGM再生開始（progress>0 もしくは playing）を検知し、開始時刻を記録する副作用
  useEffect(() => {
    const isMutedOff = isMuted === false
    if (!isMutedOff || showWelcome === false) {
      return
    }
    // ネットワークスロットリング時に buffering(3) が長く続くことがあるため、
    // buffering は「開始」とみなさない。
    const started = progressPercent > 0 || isPlaying
    if (!started) {
      return
    }
    if (playStartedAtMs === null) {
      setPlayStartedAtMs(Date.now())
    }
  }, [isMuted, progressPercent, isPlaying, showWelcome, playStartedAtMs])

  // 再生開始から一定秒数経過後にWelcomeViewをフェードアウトする副作用
  useEffect(() => {
    const isMutedOff = isMuted === false
    if (!isMutedOff || welcomeRef.current === null || showWelcome === false) {
      return
    }

    if (playStartedAtMs === null || hasQueuedFadeRef.current) {
      return
    }

    const elapsed = Date.now() - playStartedAtMs
    const remaining = Math.max(0, STARTED_TO_FADE_DELAY_MS - elapsed)

    const timer = window.setTimeout(() => {
      if (welcomeRef.current === null || hasQueuedFadeRef.current) {
        return
      }

      hasQueuedFadeRef.current = true

      animate(welcomeRef.current, {
        opacity: [1, 0],
        duration: WELCOME_FADE_DURATION_MS,
        delay: WELCOME_STARTED_FADE_DELAY_MS,
        onComplete: handleDelayedWelcomeFadeOutComplete
      })
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [isMuted, playStartedAtMs, showWelcome, handleDelayedWelcomeFadeOutComplete])

  // WelcomeView非表示後にMainViewをフェードインする副作用
  useEffect(() => {
    if (showWelcome || mainRef.current === null) {
      return
    }

    animate(mainRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: MAIN_FADE_DURATION_MS
    })
  }, [showWelcome])

  return {
    showWelcome,
    isPlayButtonShowsSpinner,
    welcomeRef,
    mainRef,
    onPlayClick
  }
}
