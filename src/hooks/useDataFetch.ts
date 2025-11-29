import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useSWRImmutable from "swr/immutable"

import { getResourceUrl } from "@/utils"

import type { SizeLocationInfo } from "@/types"

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

/** APIレスポンスデータの型定義（ポートフォリオの全体データ） */
export type PortfolioData = {
  /** 基本情報 */
  basicInfo: {
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
  const createdObjectUrlListRef = useRef<Array<string>>([])
  const progressRef = useRef<number>(0)
  const rafScheduledRef = useRef<boolean>(false)
  const isDev = import.meta.env.DEV

  // ベースデータ
  const { data: baseData } = useSWRImmutable<PortfolioData>(
    shouldFetch ? "/" : null,
    async (key: string) => {
      const res = await fetch(getResourceUrl(key), { cache: "no-store" })
      if (!res.ok) {
        throw new Error("APIフェッチに失敗しました")
      }
      return res.json() as Promise<PortfolioData>
    }
  )

  // RTT補正済みのサーバ時刻
  const { data: currentServerTime } = useSWRImmutable<string>(
    shouldFetch ? "/time/corrected" : null,
    async () => {
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
      return new Date(best.correctedCurrentMs).toISOString()
    }
  )

  const totalMediaAssets = useMemo(() => {
    if (baseData === undefined) {
      return 0
    }
    return baseData.works.length * 2 + baseData.inspiredBy.length + baseData.bgm.length
  }, [baseData])

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
    scheduleProgressFlush()
  }, [scheduleProgressFlush])

  /** 指定URLの画像を取得しObjectURLを生成 （失敗時は元URLを返す） */
  const convertToObjectUrl = useCallback(
    async (url: string): Promise<string> => {
      let objectUrlOrOriginal = url
      try {
        const res = await fetch(getResourceUrl(url))
        const blob = await res.blob()
        objectUrlOrOriginal = URL.createObjectURL(blob)
        createdObjectUrlListRef.current.push(objectUrlOrOriginal)
        if (isDev) {
          const parts = url.split("/")
          const fileName = parts.length > 0 ? parts[parts.length - 1] : url
          console.log(`  ✓ ${fileName} → ${objectUrlOrOriginal}`)
        }
      } catch (error) {
        if (isDev) {
          console.error(`  ✗ ${url.split("/").pop()}`, error)
        }
      } finally {
        markMediaFetchCompleted()
      }
      return objectUrlOrOriginal
    },
    [isDev, markMediaFetchCompleted]
  )

  /** 加工済みポートフォリオデータを生成するSWR二段目Fetcher */
  const preloadPortfolioMedia = useCallback(
    async (_key: [string, PortfolioData]): Promise<PortfolioData> => {
      const raw = _key[1]

      // 前回生成分を破棄
      if (createdObjectUrlListRef.current.length > 0) {
        createdObjectUrlListRef.current.forEach(url => URL.revokeObjectURL(url))
        createdObjectUrlListRef.current = []
      }

      // 進捗初期化
      progressRef.current = 0
      setLoadedMediaAssets(0)
      const total = raw.works.length * 2 + raw.inspiredBy.length + raw.bgm.length
      if (isDev) {
        console.log(`🖼️  画像プリロード開始（合計${total}件）`)
      }

      const worksWithObjectUrls = await Promise.all(
        raw.works.map(async work => ({
          ...work,
          thumbnail: await convertToObjectUrl(work.thumbnail),
          logo: await convertToObjectUrl(work.logo)
        }))
      )

      const inspiredByWithObjectUrls = await Promise.all(
        raw.inspiredBy.map(async item => ({
          ...item,
          icon: await convertToObjectUrl(item.icon)
        }))
      )

      const bgmWithObjectUrls = await Promise.all(
        raw.bgm.map(async track => ({
          ...track,
          artwork: await convertToObjectUrl(track.artwork)
        }))
      )

      const processed: PortfolioData = {
        ...raw,
        works: worksWithObjectUrls,
        inspiredBy: inspiredByWithObjectUrls,
        bgm: bgmWithObjectUrls
      }
      if (isDev) {
        console.log(`✅ 画像プリロード完了（合計${total}件／ObjectURL生成済み）`)
      }
      return processed
    },
    [convertToObjectUrl, isDev]
  )

  // 二段目SWR: baseDataが取得済みなら加工版を生成
  const { data: portfolioData } = useSWRImmutable<PortfolioData>(
    baseData === undefined ? null : ["processedPortfolio", baseData],
    preloadPortfolioMedia
  )

  // アンマウント時・依存除去時にObjectURLを解放
  useEffect(() => {
    return () => {
      if (createdObjectUrlListRef.current.length < 1) {
        return
      }

      createdObjectUrlListRef.current.forEach(url => URL.revokeObjectURL(url))
      if (isDev) {
        console.log(`🧹 ObjectURLを解放：${createdObjectUrlListRef.current.length}件`)
      }
    }
  }, [isDev])

  return { portfolioData, currentServerTime, mediaDownloadStatus } as const
}
