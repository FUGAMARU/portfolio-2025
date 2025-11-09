import { animate } from "animejs"
import { useCallback, useEffect, useRef, useState } from "react"

/** WelcomeView表示フェードアニメーションの所要時間(ms) */
const WELCOME_FADE_DURATION_MS = 800
/** WelcomeView表示フェードアニメーション（ミュート選択時）の開始遅延(ms) */
const WELCOME_MUTED_FADE_DELAY_MS = 200
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
  /** Welcomeをフェードアウトしてよいか（データ準備などの外部条件で制御） */
  canFadeOutWelcome?: boolean
}

/** WelcomeViewとMainViewの切替およびアニメーションを管理するフック */
export const useViewSwitch = ({
  isMuted,
  setIsMuted,
  startPlayback,
  progressPercent,
  isPlaying,
  canFadeOutWelcome = true
}: Params) => {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isPlayButtonShowsSpinner, setIsPlayButtonShowsSpinner] = useState(false)
  const playStartedAtMsRef = useRef<number>(null) // UI再描画不要のためrefで保持
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
    if (!isMutedOn || welcomeRef.current === null || !canFadeOutWelcome) {
      return
    }

    animate(welcomeRef.current, {
      opacity: [1, 0],
      duration: WELCOME_FADE_DURATION_MS,
      delay: WELCOME_MUTED_FADE_DELAY_MS,
      onComplete: handleWelcomeFadeOutComplete
    })
  }, [isMuted, canFadeOutWelcome, handleWelcomeFadeOutComplete])

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
    if (playStartedAtMsRef.current === null) {
      playStartedAtMsRef.current = Date.now()
    }
  }, [isMuted, progressPercent, isPlaying, showWelcome])

  // 再生開始から一定秒数経過後にWelcomeViewをフェードアウトする副作用
  useEffect(() => {
    const canAttemptFade =
      isMuted === false && // ミュート解除済み
      welcomeRef.current !== null &&
      showWelcome === true &&
      canFadeOutWelcome === true &&
      playStartedAtMsRef.current !== null &&
      !hasQueuedFadeRef.current

    if (!canAttemptFade) {
      return
    }

    // playStartedAtMsRef.current は canAttemptFade が true の場合非null
    const startedAt = playStartedAtMsRef.current as number
    const elapsed = Date.now() - startedAt
    const remaining = Math.max(0, STARTED_TO_FADE_DELAY_MS - elapsed)

    const timer = window.setTimeout(() => {
      if (welcomeRef.current === null || hasQueuedFadeRef.current) {
        return
      }
      hasQueuedFadeRef.current = true
      animate(welcomeRef.current, {
        opacity: [1, 0],
        duration: WELCOME_FADE_DURATION_MS,
        onComplete: handleDelayedWelcomeFadeOutComplete
      })
    }, remaining)

    return () => window.clearTimeout(timer)
  }, [
    isMuted,
    canFadeOutWelcome,
    showWelcome,
    handleDelayedWelcomeFadeOutComplete,
    progressPercent,
    isPlaying
  ])

  return {
    showWelcome,
    isPlayButtonShowsSpinner,
    welcomeRef,
    mainRef,
    onPlayClick
  }
}
