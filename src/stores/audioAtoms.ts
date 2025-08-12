import { atom } from "jotai"

import type { ApiResponse } from "@/hooks/useDataFetch"

/** プレイリスト（シャッフル後） */
export const playlistAtom = atom<ApiResponse["bgm"]>([])

/** 現在のトラック位置 */
export const audioTrackIndexAtom = atom<number>(0)

/** 現在のトラック */
export const currentTrackAtom = atom<ApiResponse["bgm"][number] | undefined>(get => {
  const list = get(playlistAtom)
  const index = get(audioTrackIndexAtom)
  return list[index]
})

/** 再生位置（0-100%） */
export const playbackProgressAtom = atom<number>(0)

/**
 * YouTube の再生状態
 * - -1: unstarted
 * - 0: ended
 * - 1: playing
 * - 2: paused
 * - 3: buffering
 * - 5: video cued
 */
export const playbackStateAtom = atom<number>(-1)

/** 再生コントロール */
export const audioControlsAtom = atom<
  | {
      /** 再生 */
      play: () => void
      /** 一時停止 */
      pause: () => void
      /** 次のトラックへ */
      next: () => void
    }
  | undefined
>()

/** 再生中フラグ */
export const audioIsPlayingAtom = atom<boolean>(get => get(playbackStateAtom) === 1)
