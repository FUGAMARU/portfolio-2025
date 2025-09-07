import { clamp } from "es-toolkit"
import { useCallback, useRef } from "react"

import type { RefObject } from "react"
import type { YouTubePlayer } from "react-youtube"

/** フェードの1ステップ間隔（ms） */
const FADE_TICK_INTERVAL_MS = 20
/** デフォルトのフェード継続時間（ms） */
const DEFAULT_FADE_DURATION_MS = 400
/** フェードイン完了時の目標音量（0-100） */
const INTENDED_VOLUME = 100

/** 音量フェード制御 */
export const useAudioFade = (playerRef: RefObject<YouTubePlayer | null>) => {
  // 音量フェード管理 (フック内で完結しUIへ直接反映しない内部状態のためuseRefで保持)
  const currentVolumeRef = useRef<number>(100) // 現在の実音量（0-100）。フェードの起点/途中値
  const fadeTimerRef = useRef<number | null>(null) // フェード用interval ID。停止判定に使用
  const pendingFadeInRef = useRef<boolean>(false) // 再生開始後にフェードインすべき状態か
  const isPausingRef = useRef<boolean>(false) // フェードアウト後にpauseを実行してよいか
  const actionSeqRef = useRef<number>(0) // 操作の世代カウンタ。割込み検出用

  /** フェード用のintervalを停止し、状態をクリアする */
  const clearFadeTimer = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      clearInterval(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }, [])

  /** プレイヤーの音量を0-100に丸めて設定し、現在値を保持する */
  const setPlayerVolume = useCallback(
    (volume: number) => {
      const player = playerRef.current
      if (player === null) {
        return
      }

      const clamped = clamp(Math.round(volume), 0, 100)
      currentVolumeRef.current = clamped
      player.setVolume(clamped)
    },
    [playerRef]
  )

  /** 音量をtargetVolumeへdurationMsミリ秒かけて線形にフェードさせる */
  const fadeTo = useCallback(
    (targetVolume: number, durationMs: number = DEFAULT_FADE_DURATION_MS) => {
      const player = playerRef.current
      if (player === null) {
        return Promise.resolve()
      }

      clearFadeTimer()

      const startVolume = currentVolumeRef.current
      const totalChange = targetVolume - startVolume
      if (totalChange === 0 || durationMs <= 0) {
        setPlayerVolume(targetVolume)
        return Promise.resolve()
      }

      const intervalMs = FADE_TICK_INTERVAL_MS
      const steps = Math.max(1, Math.floor(durationMs / intervalMs))
      const deltaPerStep = totalChange / steps
      let currentStep = 0

      return new Promise<void>(resolve => {
        fadeTimerRef.current = window.setInterval(() => {
          currentStep += 1
          const next = startVolume + deltaPerStep * currentStep
          setPlayerVolume(next)

          if (currentStep >= steps) {
            clearFadeTimer()
            setPlayerVolume(targetVolume)
            resolve()
          }
        }, intervalMs)
      })
    },
    [clearFadeTimer, setPlayerVolume, playerRef]
  )

  /** 一時停止からの再開に向けて、フェードイン開始前の準備を行う */
  const prepareFadeInForResume = useCallback(() => {
    isPausingRef.current = false
    actionSeqRef.current += 1
    pendingFadeInRef.current = true
    clearFadeTimer()
    setPlayerVolume(0)
  }, [clearFadeTimer, setPlayerVolume])

  /** フェードを使わずに即時再生するための音量状態に整える */
  const prepareImmediatePlaybackVolume = useCallback(() => {
    isPausingRef.current = false
    pendingFadeInRef.current = false
    clearFadeTimer()
    setPlayerVolume(INTENDED_VOLUME)
  }, [clearFadeTimer, setPlayerVolume])

  return {
    fadeTo,
    prepareFadeInForResume,
    prepareImmediatePlaybackVolume,
    pendingFadeInRef,
    isPausingRef,
    actionSeqRef,
    clearFadeTimer,
    INTENDED_VOLUME
  }
}
