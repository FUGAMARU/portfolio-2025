import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useSWRImmutable from "swr/immutable"

import { getResourceUrl } from "@/utils"

import type { SizeLocationInfo } from "@/types"

/** プロフィール */
export type Profile = {
  /** 名前 */
  name: string
  /** 肩書き */
  title: string
  /** 生年月日 */
  birthday: string
  /** バッジ */
  badges: {
    /** 上部バッジ */
    upper: Array<
      {
        /** 画像 */
        src: string
        /** 遷移先 */
        href: string
      } & Pick<SizeLocationInfo, "height">
    >
    /** 下部バッジ */
    lower: Array<
      {
        /** 画像 */
        src: string
        /** 遷移先 */
        href: string
      } & Pick<SizeLocationInfo, "height">
    >
  }
}

/** 作品 */
export type Work = {
  /** 作品ID */
  id: string
  /** アイコン */
  icon: string
  /** サムネイル */
  thumbnail: string
  /** ロゴ */
  logo: string
  /** ロゴ画像拡大率 */
  logoScale?: number
  /** タグ一覧 */
  tags: Array<string>
  /** 説明文 */
  description: string
  /** 参考リンク一覧 */
  referenceLinks: Array<{
    /** テキスト */
    text: string
    /** 遷移先 */
    href: string
  }>
}

/** 基本情報 */
export type BasicInfo = {
  /** Inspired By */
  inspiredBy: Array<{
    /** ID */
    id: string
    /** タイプ */
    type: "background" | "visual" | "font"
    /** アイコン */
    icon: string
    /** ラベル */
    label: string
    /** 遷移先 */
    href: string
  }>
  /** BGM */
  bgm: Array<{
    /** タイトル */
    title: string
    /** アーティスト */
    artists: Array<string>
    /** アートワーク */
    artwork: string
    /** YouTube動画ID */
    youtubeId: string
  }>
  /** 作品一覧 */
  works: Array<Work>
}

/**
 * データフェッチフック
 *
 * @param shouldFetch - true のときのみフェッチ処理を実行する
 */
export const useDataFetch = (shouldFetch: boolean = true) => {
  const [loadedMediaAssets, setLoadedMediaAssets] = useState<number>(0)
  const progressRef = useRef<number>(0)
  const rafScheduledRef = useRef<boolean>(false)

  // RTT補正済みのサーバ時刻
  const { data: currentServerTime } = useSWRImmutable<string>(
    shouldFetch ? "/time/corrected" : null,
    async () => {
      const now = new Date().toISOString()
      console.log(`[${now}] 🕐 サーバー時刻取得開始`)
      try {
        const t0a = performance.now()
        const [r1, r2] = await Promise.all([
          fetch(getResourceUrl("/time"), { cache: "no-store" }),
          fetch(getResourceUrl("/time"), { cache: "no-store" })
        ])

        /** 時刻レスポンスを読み込み、RTT/2で補正した受信時点のサーバー時刻を算出する */
        const measure = async (res: Response, startPerf: number) => {
          const text = (await res.text()).trim().replace(/^"|"$/g, "")
          const serverMs = new Date(text).getTime()
          const endPerf = performance.now()
          const rtt = endPerf - startPerf
          const correctedCurrentMs = serverMs + rtt / 2
          return { rtt, correctedCurrentMs }
        }

        const m1 = await measure(r1, t0a)
        const m2Start = performance.now()
        const m2 = await measure(r2, m2Start)
        const best = m1.rtt <= m2.rtt ? m1 : m2
        const result = new Date(best.correctedCurrentMs).toISOString()
        console.log(
          `[${new Date().toISOString()}] ✓ サーバー時刻取得完了 | RTT: ${best.rtt.toFixed(1)}ms`
        )
        return result
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ✗ サーバー時刻取得失敗`, error)
        throw error
      }
    }
  )

  // プロフィール情報
  const { data: profile } = useSWRImmutable<Profile>(
    shouldFetch ? "/profile" : null,
    async (key: string) => {
      const now = new Date().toISOString()
      console.log(`[${now}] 👤 プロフィール取得開始`)
      try {
        const startTime = performance.now()
        const url = new URL(getResourceUrl(key))
        url.searchParams.set("origin", window.location.origin)
        const res = await fetch(url.toString(), { cache: "no-store" })
        if (!res.ok) {
          throw new Error("APIフェッチに失敗しました")
        }
        const data = (await res.json()) as Profile
        const duration = performance.now() - startTime
        console.log(
          `[${new Date().toISOString()}] ✓ プロフィール取得完了 (${duration.toFixed(1)}ms)`
        )
        return data
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ✗ プロフィール取得失敗`, error)
        throw error
      }
    }
  )

  // 基本情報
  const { data: basicInfo } = useSWRImmutable<BasicInfo>(
    shouldFetch ? "/" : null,
    async (key: string) => {
      const now = new Date().toISOString()
      console.log(`[${now}] 📋 基本情報取得開始`)
      try {
        const startTime = performance.now()
        const res = await fetch(getResourceUrl(key), { cache: "no-store" })
        if (!res.ok) {
          throw new Error("APIフェッチに失敗しました")
        }
        const data = (await res.json()) as BasicInfo
        const duration = performance.now() - startTime
        console.log(
          `[${new Date().toISOString()}] ✓ 基本情報取得完了 (${duration.toFixed(1)}ms) | 作品数: ${data.works.length}, Inspired By: ${data.inspiredBy.length}, BGM: ${data.bgm.length}`
        )
        return data
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ✗ 基本情報取得失敗`, error)
        throw error
      }
    }
  )

  const totalMediaAssets = useMemo(() => {
    if (basicInfo === undefined || profile === undefined) {
      return 0
    }
    const badgesCount = profile.badges.upper.length + profile.badges.lower.length
    return (
      basicInfo.works.length * 2 + basicInfo.inspiredBy.length + basicInfo.bgm.length + badgesCount
    )
  }, [basicInfo, profile])

  const mediaDownloadStatus = useMemo(
    () => ({
      total: totalMediaAssets,
      loaded: loadedMediaAssets,
      progress: totalMediaAssets === 0 ? 0 : loadedMediaAssets / totalMediaAssets,
      isComplete: totalMediaAssets > 0 && loadedMediaAssets >= totalMediaAssets
    }),
    [totalMediaAssets, loadedMediaAssets]
  )

  /** requestAnimationFrameを使って進捗をバッチ反映 */
  const scheduleProgressFlush = useCallback(() => {
    if (rafScheduledRef.current) {
      return
    }

    rafScheduledRef.current = true
    requestAnimationFrame(() => {
      setLoadedMediaAssets(progressRef.current)
      rafScheduledRef.current = false
    })
  }, [])

  /** 単一メディア（画像）取得処理が成功・失敗を問わず終了したことを記録し、次フレームでバッチ反映をスケジュールする */
  const markMediaFetchCompleted = useCallback(() => {
    progressRef.current += 1
    const now = new Date().toISOString()
    console.log(`[${now}] メディアロード進捗: ${progressRef.current}/${totalMediaAssets}`)
    scheduleProgressFlush()
  }, [scheduleProgressFlush, totalMediaAssets])

  /** 指定URLの画像を取得しObjectURLを生成 （失敗時は元URLを返す） */
  const convertToObjectUrl = useCallback(
    async (url: string): Promise<string> => {
      let objectUrlOrOriginal = url
      const startTime = performance.now()
      const parts = url.split("/")
      const fileName = parts.length > 0 ? parts[parts.length - 1] : url
      const now = new Date().toISOString()

      try {
        console.log(`[${now}] 📥 ロード開始: ${fileName}`)
        const fetchStartTime = performance.now()
        const res = await fetch(getResourceUrl(url), { cache: "no-store" })
        const fetchDuration = performance.now() - fetchStartTime

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const blobStartTime = performance.now()
        const blob = await res.blob()
        const blobDuration = performance.now() - blobStartTime

        if (blob.size === 0) {
          throw new Error("Empty blob received")
        }

        objectUrlOrOriginal = URL.createObjectURL(blob)
        const totalDuration = performance.now() - startTime
        console.log(
          `[${new Date().toISOString()}] ✓ ${fileName} | サイズ: ${blob.size}B | 取得: ${fetchDuration.toFixed(1)}ms | Blob処理: ${blobDuration.toFixed(1)}ms | 合計: ${totalDuration.toFixed(1)}ms`
        )
      } catch (error) {
        const errorDuration = performance.now() - startTime
        console.error(
          `[${new Date().toISOString()}] ✗ ${fileName} のロード失敗 (${errorDuration.toFixed(1)}ms)`,
          error
        )
      } finally {
        markMediaFetchCompleted()
      }
      return objectUrlOrOriginal
    },
    [markMediaFetchCompleted]
  )

  /** 加工済みプロフィールデータを生成するSWR二段目Fetcher */
  const preloadProfileMedia = useCallback(
    async (_key: [string, Profile]): Promise<Profile> => {
      const raw = _key[1]
      const startTime = performance.now()
      const now = new Date().toISOString()

      console.log(
        `[${now}] 🖼️  プロフィール画像プリロード開始 (上部バッジ: ${raw.badges.upper.length}, 下部バッジ: ${raw.badges.lower.length})`
      )

      try {
        // バッジ画像をObjectURLに変換
        const upperBadgesWithObjectUrls = await Promise.all(
          raw.badges.upper.map(async badge => ({
            ...badge,
            src: await convertToObjectUrl(badge.src)
          }))
        )

        const lowerBadgesWithObjectUrls = await Promise.all(
          raw.badges.lower.map(async badge => ({
            ...badge,
            src: await convertToObjectUrl(badge.src)
          }))
        )

        const duration = performance.now() - startTime
        console.log(
          `[${new Date().toISOString()}] ✅ プロフィール画像プリロード完了 (${duration.toFixed(1)}ms)`
        )

        return {
          ...raw,
          badges: {
            upper: upperBadgesWithObjectUrls,
            lower: lowerBadgesWithObjectUrls
          }
        }
      } catch (error) {
        const duration = performance.now() - startTime
        console.error(
          `[${new Date().toISOString()}] ❌ プロフィール画像プリロード失敗 (${duration.toFixed(1)}ms)`,
          error
        )
        throw error
      }
    },
    [convertToObjectUrl]
  )

  // 進捗の初期化
  useEffect(() => {
    if (!(profile !== undefined || basicInfo !== undefined)) {
      return
    }

    // データフェッチが始まったら進捗をリセット
    const now = new Date().toISOString()
    console.log(`[${now}] 🔄 メディアロード進捗をリセット`)
    progressRef.current = 0
    setLoadedMediaAssets(0)
  }, [profile, basicInfo])

  /** 加工済みポートフォリオデータを生成するSWR二段目Fetcher */
  const preloadPortfolioMedia = useCallback(
    async (_key: [string, BasicInfo]): Promise<BasicInfo> => {
      const raw = _key[1]
      const startTime = performance.now()
      const now = new Date().toISOString()

      console.log(
        `[${now}] 🖼️  基本情報画像プリロード開始 (作品: ${raw.works.length}, Inspired By: ${raw.inspiredBy.length}, BGM: ${raw.bgm.length})`
      )

      try {
        const worksStartTime = performance.now()
        const worksWithObjectUrls = await Promise.all(
          raw.works.map(async work => ({
            ...work,
            thumbnail: await convertToObjectUrl(work.thumbnail),
            logo: await convertToObjectUrl(work.logo)
          }))
        )
        const worksDuration = performance.now() - worksStartTime
        console.log(
          `[${new Date().toISOString()}] 📦 作品画像ロード完了: ${worksDuration.toFixed(1)}ms`
        )

        const inspiredStartTime = performance.now()
        const inspiredByWithObjectUrls = await Promise.all(
          raw.inspiredBy.map(async item => ({
            ...item,
            icon: await convertToObjectUrl(item.icon)
          }))
        )
        const inspiredDuration = performance.now() - inspiredStartTime
        console.log(
          `[${new Date().toISOString()}] 📦 Inspired By画像ロード完了: ${inspiredDuration.toFixed(1)}ms`
        )

        const bgmStartTime = performance.now()
        const bgmWithObjectUrls = await Promise.all(
          raw.bgm.map(async track => ({
            ...track,
            artwork: await convertToObjectUrl(track.artwork)
          }))
        )
        const bgmDuration = performance.now() - bgmStartTime
        console.log(
          `[${new Date().toISOString()}] 📦 BGM画像ロード完了: ${bgmDuration.toFixed(1)}ms`
        )

        const processed: BasicInfo = {
          ...raw,
          works: worksWithObjectUrls,
          inspiredBy: inspiredByWithObjectUrls,
          bgm: bgmWithObjectUrls
        }
        const totalDuration = performance.now() - startTime
        console.log(
          `[${new Date().toISOString()}] ✅ 基本情報画像プリロード完了 (合計: ${totalDuration.toFixed(1)}ms)`
        )
        return processed
      } catch (error) {
        const duration = performance.now() - startTime
        console.error(
          `[${new Date().toISOString()}] ❌ 基本情報画像プリロード失敗 (${duration.toFixed(1)}ms)`,
          error
        )
        throw error
      }
    },
    [convertToObjectUrl]
  )

  // 二段目SWR: profileが取得済みなら加工版を生成
  const { data: profileData } = useSWRImmutable<Profile>(
    profile === undefined ? null : ["processedProfile", profile],
    preloadProfileMedia
  )

  // 二段目SWR: basicInfoが取得済みなら加工版を生成
  const { data: portfolioData } = useSWRImmutable<BasicInfo>(
    basicInfo === undefined ? null : ["processedPortfolio", basicInfo],
    preloadPortfolioMedia
  )

  return { profileData, portfolioData, currentServerTime, mediaDownloadStatus } as const
}
