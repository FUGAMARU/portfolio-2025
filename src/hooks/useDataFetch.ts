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

  useEffect(() => {
    /** データ取得関数 */
    const fetchData = async () => {
      try {
        // 時刻だけは2回フェッチして最小RTTを採用
        const t0a = performance.now()
        const basicDataPromise = fetch(getResourceUrl("/"))
        const timePromise1 = fetch(getResourceUrl("/time"), { cache: "no-store" })
        const timePromise2 = fetch(getResourceUrl("/time"), { cache: "no-store" })
        const [basicDataResponse, timeResponse1, timeResponse2] = await Promise.all([
          basicDataPromise,
          timePromise1,
          timePromise2
        ])

        if (!basicDataResponse.ok || !timeResponse1.ok || !timeResponse2.ok) {
          throw new Error("API response not ok")
        }

        const result: PortfolioData = await basicDataResponse.json()
        setPortfolioData(result)

        // 取得できた2つの時刻レスポンスを計測し、RTTが最も小さい測定結果を採用

        /** 時刻レスポンスを読み込み RTT/2補正後の『受信時点でのサーバー現在時刻』を算出する */
        const measureServerTime = async (res: Response, startPerf: number) => {
          const text = (await res.text()).trim().replace(/^"|"$/g, "")
          const serverMs = new Date(text).getTime()
          const endPerf = performance.now()
          const rtt = endPerf - startPerf
          const correctedCurrentMs = serverMs + rtt / 2
          return { rtt, correctedCurrentMs }
        }

        const measurement1 = await measureServerTime(timeResponse1, t0a)
        const measurement2Start = performance.now()
        const measurement2 = await measureServerTime(timeResponse2, measurement2Start)
        const best = measurement1.rtt <= measurement2.rtt ? measurement1 : measurement2
        setCurrentServerTime(new Date(best.correctedCurrentMs).toISOString())
      } catch (e) {
        console.error(e)
        alert("APIにアクセスできませんでした")
      }
    }

    fetchData()
  }, [])

  return { portfolioData, currentServerTime } as const
}
