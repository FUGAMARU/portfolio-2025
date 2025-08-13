import { atom } from "jotai"
import { Vibrant } from "node-vibrant/browser"

import type { PortfolioData } from "@/hooks/useDataFetch"

/** プレイリスト （シャッフル済み） */
export const playlistAtom = atom<PortfolioData["bgm"]>([])

/** 現在のトラック位置 */
export const audioTrackIndexAtom = atom<number>(0)

/** 現在のトラック */
export const currentTrackAtom = atom<PortfolioData["bgm"][number] | undefined>(get => {
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

/**
 * 再生中フラグ（UIアイコン制御用）
 * YouTubeの状態 1: playing に加え、3: buffering 中も再生継続扱いとして true を返す。
 * これにより再生再開直後の一瞬の buffering でアイコンが Play に戻る問題を防ぐ。
 */
export const isAudioPlayingAtom = atom<boolean>(get => {
  const state = get(playbackStateAtom)
  return state === 1 || state === 3
})

/** 楽曲ごとのテーマカラー（key: youtubeId, value: HEX） */
export const artworkThemeColorMapAtom = atom<Record<string, string>>({})

/** 再生中トラックのテーマカラー */
export const currentTrackThemeColorAtom = atom<string | undefined>(get => {
  const currentTrack = get(currentTrackAtom)
  const colorMap = get(artworkThemeColorMapAtom)
  if (currentTrack === undefined) {
    return undefined
  }
  return colorMap[currentTrack.youtubeId]
})

/** プレイリストのアートワークからテーマカラーを抽出してartworkThemeColorMapAtomを更新する */
export const populateArtworkThemeColorsAtom = atom(null, async (get, set) => {
  const playlist = get(playlistAtom)
  const existing = get(artworkThemeColorMapAtom)
  const missing = playlist.filter(track => existing[track.youtubeId] === undefined)

  if (missing.length === 0) {
    return
  }

  const palettes = await Promise.all(missing.map(track => Vibrant.from(track.artwork).getPalette()))
  const entries = missing.map((track, index) => {
    const hex = palettes[index]?.Vibrant?.hex ?? "#a8a8a8"
    return [track.youtubeId, hex]
  })

  const next = Object.fromEntries(entries)
  set(artworkThemeColorMapAtom, { ...existing, ...next })
})
