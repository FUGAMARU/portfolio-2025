import { useMemo, useRef } from "react"

import { useAudioArtworkPreload } from "@/hooks/useAudio/useAudioArtworkPreload"
import { useAudioExposeControls } from "@/hooks/useAudio/useAudioExposeControls"
import { useAudioFade } from "@/hooks/useAudio/useAudioFade"
import { useAudioPlaybackState } from "@/hooks/useAudio/useAudioPlaybackState"
import { useAudioPlaylist } from "@/hooks/useAudio/useAudioPlaylist"
import { useAudioProgress } from "@/hooks/useAudio/useAudioProgress"
import { useAudioTrackNavigation } from "@/hooks/useAudio/useAudioTrackNavigation"

import type { BasicInfo } from "@/hooks/useDataFetch"
import type { YouTubeEvent, YouTubePlayer } from "react-youtube"

/**
 * オーディオ再生用カスタムフック
 * App.tsxからPlayerWindowまでAtomを使わずにPropsでデーターを伝搬するとMainViewを経由することになるが、MainViewは要素が多くレンダリングコストが高めなのでAtomを使うことによってMainViewを経由せずにPlayerWindowに直接データーを伝搬している。
 */
export const useAudio = (bgm: BasicInfo["bgm"]) => {
  // プレイヤー参照を親で一元管理
  const playerRef = useRef<YouTubePlayer | null>(null)

  // 1. プレイリスト関連
  const { playlist, youtubeIdList } = useAudioPlaylist(bgm)

  // 2. フェード制御
  const fade = useAudioFade(playerRef)

  // 3. トラックナビゲーション
  const trackNav = useAudioTrackNavigation(
    playerRef,
    youtubeIdList,
    fade.prepareImmediatePlaybackVolume
  )
  const { currentYoutubeId } = trackNav

  // 4. 再生状態/イベント連携
  const playback = useAudioPlaybackState(playerRef, fade, currentYoutubeId)

  // 5. 進捗ポーリング
  useAudioProgress(playerRef)

  // 6. アートワークテーマカラー事前計算
  useAudioArtworkPreload(playlist)

  // 7. コントロール公開（オブジェクト再生成による不要なatom更新を避けるためメモ化）
  const controls = useMemo(
    () => ({
      play: playback.handlePlayButtonClick,
      pause: playback.handlePauseButtonClick,
      next: trackNav.goToNextTrack
    }),
    [playback.handlePlayButtonClick, playback.handlePauseButtonClick, trackNav.goToNextTrack]
  )
  useAudioExposeControls(controls)

  /** YouTubeプレイヤーの状態がReadyになった時の処理 */
  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    playback.handleReady(event)
  }

  return {
    handleReady,
    handlePlayButtonClick: playback.handlePlayButtonClick,
    goToNextTrack: trackNav.goToNextTrack,
    handlePlaybackStateChange: playback.handlePlaybackStateChange,
    currentYoutubeId,
    controls
  }
}
