import { shuffle } from "es-toolkit"
import { useAtom, useSetAtom } from "jotai"
import { useEffect, useRef, useMemo, useCallback } from "react"

import {
  playbackProgressAtom,
  playbackStateAtom,
  playlistAtom,
  audioTrackIndexAtom,
  audioControlsAtom
} from "@/stores/audioAtoms"
import { populateArtworkThemeColorsAtom } from "@/stores/audioAtoms"

import type { PortfolioData } from "@/hooks/useDataFetch"
import type { YouTubeEvent, YouTubePlayer } from "react-youtube"

/** フェードの1ステップ間隔（ms） */
const FADE_TICK_INTERVAL_MS = 20
/** デフォルトのフェード継続時間（ms） */
const DEFAULT_FADE_DURATION_MS = 400
/** 再生位置の更新頻度（ms） */
const PLAYBACK_PROGRESS_INTERVAL_MS = 100

/**
 * 次トラックのインデックスを求める
 * listLength が 0 の場合は 0 を返す
 */
const getNextTrackIndex = (currentIndex: number, listLength: number): number => {
  if (listLength <= 0) {
    return 0
  }
  return (currentIndex + 1) % listLength
}

/**
 * オーディオ再生用カスタムフック
 * App.tsxからPlayerWindowまでAtomを使わずにPropsでデーターを伝搬するとMainViewを経由することになるが、MainViewは要素が多くレンダリングコストが高めなのでAtomを使うことによってMainViewを経由せずにPlayerWindowに直接データーを伝搬している。
 */
export const useAudio = (portfolioBgmData: PortfolioData["bgm"]) => {
  // APIレスポンスデータ関連
  const shuffledBgmData = useMemo(() => shuffle(portfolioBgmData), [portfolioBgmData])
  const [playlist, setPlaylist] = useAtom(playlistAtom)
  const youtubeIdList = useMemo(() => playlist.map(bgm => bgm.youtubeId), [playlist])

  // 再生ステータス関連
  const setPlaybackProgress = useSetAtom(playbackProgressAtom)
  const [currentTrackIndex, setCurrentTrackIndex] = useAtom(audioTrackIndexAtom)
  const currentYoutubeId = useMemo(
    () => youtubeIdList[currentTrackIndex],
    [youtubeIdList, currentTrackIndex]
  )

  // プレイヤー関連
  const setAudioControls = useSetAtom(audioControlsAtom)
  const [playbackState, setPlaybackState] = useAtom(playbackStateAtom)
  const playerRef = useRef<YouTubePlayer>(null)
  const populateArtworkThemeColors = useSetAtom(populateArtworkThemeColorsAtom)

  // 音量フェード管理 (フック内で完結しUIへ直接反映しない内部状態のためuseRefで保持)
  const intendedVolumeRef = useRef<number>(100) // 目標音量（0-100）。フェードイン完了時の到達値
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
  const setPlayerVolume = useCallback((volume: number) => {
    const player = playerRef.current
    if (player === null) {
      return
    }
    const clamped = Math.max(0, Math.min(100, Math.round(volume)))
    currentVolumeRef.current = clamped
    player.setVolume(clamped)
  }, [])

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
    [clearFadeTimer, setPlayerVolume]
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
    setPlayerVolume(intendedVolumeRef.current)
  }, [clearFadeTimer, setPlayerVolume])

  /** 再生準備が完了した時の処理 */
  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    event.target.setPlaybackQuality("small") // 音声しか使用しないので
  }

  /** 再生ボタンを押下した時の処理 */
  const handlePlayButtonClick = useCallback(() => {
    const player = playerRef.current

    if (player === null) {
      return
    }

    // UIを即時に再生状態へ（アイコンを先に切り替える）
    setPlaybackState(1)

    // 一時停止状態からの再開のみフェードイン
    if (playbackState === 2) {
      prepareFadeInForResume()
    } else {
      prepareImmediatePlaybackVolume()
    }

    if (playbackState === 0) {
      if (currentYoutubeId !== undefined) {
        player.loadVideoById(currentYoutubeId)
      } else {
        player.playVideo()
      }
    } else {
      player.playVideo()
    }
  }, [
    currentYoutubeId,
    playbackState,
    prepareFadeInForResume,
    prepareImmediatePlaybackVolume,
    setPlaybackState
  ])

  /** 一時停止ボタンを押下した時の処理 */
  const handlePauseButtonClick = useCallback(() => {
    const player = playerRef.current

    if (player === null) {
      return
    }

    // UIを即時に一時停止状態へ（アイコンを先に切り替える）
    setPlaybackState(2)

    pendingFadeInRef.current = false
    isPausingRef.current = true
    const mySeq = ++actionSeqRef.current
    clearFadeTimer()
    // フェードアウト後に一時停止
    fadeTo(0).then(() => {
      // 途中で他アクションが走っていなければ pause 実行
      if (actionSeqRef.current === mySeq && isPausingRef.current) {
        player.pauseVideo()
      }
    })
  }, [fadeTo, clearFadeTimer, setPlaybackState])

  /** 次のトラックに遷移する処理 */
  const goToNextTrack = useCallback(() => {
    const nextTrackIndex = getNextTrackIndex(currentTrackIndex, youtubeIdList.length)

    setCurrentTrackIndex(nextTrackIndex)

    const player = playerRef.current

    if (player === null) {
      return
    }

    prepareImmediatePlaybackVolume()
    player.loadVideoById(youtubeIdList[nextTrackIndex])
    player.playVideo()
  }, [currentTrackIndex, youtubeIdList, setCurrentTrackIndex, prepareImmediatePlaybackVolume])

  /** 再生状態が変更された時の処理 */
  const handlePlaybackStateChange = useCallback(
    (event: YouTubeEvent) => {
      setPlaybackState(event.data)
      // 再生が開始されたらフェードイン
      if (event.data === 1 && pendingFadeInRef.current) {
        pendingFadeInRef.current = false
        fadeTo(intendedVolumeRef.current)
      }
    },
    [setPlaybackState, fadeTo]
  )

  // プレイリストを初期化
  useEffect(() => {
    if (playlist.length === 0 && shuffledBgmData.length > 0) {
      setPlaylist(shuffledBgmData)
    }
  }, [playlist.length, shuffledBgmData, setPlaylist])

  // 再生コントロールを公開
  useEffect(() => {
    setAudioControls({
      play: handlePlayButtonClick,
      pause: handlePauseButtonClick,
      next: goToNextTrack
    })
  }, [setAudioControls, handlePlayButtonClick, handlePauseButtonClick, goToNextTrack])

  // プレイリストが用意できたらテーマカラーを事前計算
  useEffect(() => {
    if (playlist.length === 0) {
      return
    }
    populateArtworkThemeColors()
  }, [playlist, populateArtworkThemeColors])

  // 再生位置を更新
  useEffect(() => {
    const interval = setInterval(async () => {
      const player = playerRef.current
      const currentTime = await player?.getCurrentTime()
      const duration = await player?.getDuration?.()

      if (player === null || currentTime === undefined || typeof duration !== "number") {
        return
      }

      const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0
      setPlaybackProgress(progress)
    }, PLAYBACK_PROGRESS_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [setPlaybackProgress])

  // フェード用intervalを確実に停止する（StrictModeの再マウント対策）
  useEffect(() => {
    return () => {
      clearFadeTimer()
    }
  }, [clearFadeTimer])

  return {
    handleReady,
    handlePlayButtonClick,
    goToNextTrack,
    handlePlaybackStateChange,
    currentYoutubeId
  }
}
