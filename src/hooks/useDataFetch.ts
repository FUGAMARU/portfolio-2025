import axios from "axios"
import { useEffect, useState } from "react"

import { getResourceUrl } from "@/utils"

/** 作品 */
export type Work = {
  /** 作品ID */
  id: string
  /** ボタン表示用の画像 */
  buttonImage: string
  /** プレビュー画像 */
  previewImage: string
  /** ロゴ画像 */
  logoImage: string
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
      upper: Array<{
        /** 画像 */
        src: string
        /** 遷移先 */
        href: string
        /** 高さ */
        height: number
      }>
      /** 下部バッジ */
      lower: Array<{
        /** 画像 */
        src: string
        /** 遷移先 */
        href: string
        /** 高さ */
        height: number
      }>
    }
  }
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

/** データフェッチフック */
export const useDataFetch = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>()
  const [currentServerTime, setCurrentServerTime] = useState<string>()
  const isDev = import.meta.env.DEV

  useEffect(() => {
    /** データ取得関数 */
    const fetchData = async () => {
      try {
        // 時刻だけは2回フェッチして最小RTTを採用
        const t0a = performance.now()
        const basicDataPromise = axios.get<PortfolioData>(getResourceUrl("/"))
        const timePromise1 = axios.get<string>(getResourceUrl("/time"), {
          headers: { "Cache-Control": "no-store" }
        })
        const timePromise2 = axios.get<string>(getResourceUrl("/time"), {
          headers: { "Cache-Control": "no-store" }
        })
        const [basicDataResponse, timeResponse1, timeResponse2] = await Promise.all([
          basicDataPromise,
          timePromise1,
          timePromise2
        ])

        const result = basicDataResponse.data

        // 画像をBlobとして取得してObjectURLに変換
        if (isDev) {
          console.log("🖼️  画像プリロード開始（createObjectURL使用）")
        }

        /**
         * 画像URLをBlobから生成したObjectURLに変換する
         *
         * @param url - 元の画像URL
         * @returns ObjectURL
         */
        const convertToObjectUrl = async (url: string): Promise<string> => {
          try {
            const fullUrl = getResourceUrl(url)
            const response = await axios.get(fullUrl, { responseType: "blob" })
            const objectUrl = URL.createObjectURL(response.data)
            if (isDev) {
              console.log(`  ✓ ${url.split("/").pop()} → ${objectUrl}`)
            }
            return objectUrl
          } catch (error) {
            if (isDev) {
              console.error(`  ✗ ${url.split("/").pop()}`, error)
            }
            // エラーの場合は元のURLを返す
            return url
          }
        }

        // Works画像を変換
        const worksWithObjectUrls = await Promise.all(
          result.works.map(async work => ({
            ...work,
            previewImage: await convertToObjectUrl(work.previewImage),
            logoImage: await convertToObjectUrl(work.logoImage)
          }))
        )

        // アートワークを変換
        const bgmWithObjectUrls = await Promise.all(
          result.bgm.map(async track => {
            // 外部URL（Spotifyなど）はそのまま使用
            if (track.artwork.startsWith("http")) {
              return track
            }
            return {
              ...track,
              artwork: await convertToObjectUrl(track.artwork)
            }
          })
        )

        const processedData = {
          ...result,
          works: worksWithObjectUrls,
          bgm: bgmWithObjectUrls
        } satisfies PortfolioData

        if (isDev) {
          console.log("✅ 画像プリロード完了（ObjectURL生成済み）")
        }

        setPortfolioData(processedData)

        // 取得できた2つの時刻レスポンスを計測し、RTTが最も小さい測定結果を採用

        /** 時刻レスポンスを読み込み RTT/2補正後の『受信時点でのサーバー現在時刻』を算出する */
        const measureServerTime = (
          res: {
            /** 時刻文字列のレスポンスデータ */
            data: string
          },
          startPerf: number
        ): {
          /** ラウンドトリップタイム（ミリ秒） */
          rtt: number
          /** RTT/2で補正した受信時点でのサーバー現在時刻（ミリ秒） */
          correctedCurrentMs: number
        } => {
          const text = res.data.trim().replace(/^"|"$/g, "")
          const serverMs = new Date(text).getTime()
          const endPerf = performance.now()
          const rtt = endPerf - startPerf
          const correctedCurrentMs = serverMs + rtt / 2
          return { rtt, correctedCurrentMs }
        }

        const measurement1 = measureServerTime(timeResponse1, t0a)
        const measurement2Start = performance.now()
        const measurement2 = measureServerTime(timeResponse2, measurement2Start)
        const best = measurement1.rtt <= measurement2.rtt ? measurement1 : measurement2
        setCurrentServerTime(new Date(best.correctedCurrentMs).toISOString())
      } catch (e) {
        console.error(e)
        alert("APIにアクセスできませんでした")
      }
    }

    fetchData()
  }, [isDev])

  return { portfolioData, currentServerTime } as const
}
