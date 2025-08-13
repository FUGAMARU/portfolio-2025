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
        const [dataResponse, timeResponse] = await Promise.all([
          fetch(getResourceUrl("/")),
          fetch(getResourceUrl("/time"))
        ])

        if (!dataResponse.ok || !timeResponse.ok) {
          throw new Error("API response not ok")
        }

        const result: PortfolioData = await dataResponse.json()
        setPortfolioData(result)

        const rawText = (await timeResponse.text()).trim()
        const iso = rawText.replace(/^"|"$/g, "")
        setCurrentServerTime(iso)
      } catch (e) {
        console.error(e)
        alert("APIにアクセスできませんでした")
      }
    }

    fetchData()
  }, [])

  return { portfolioData, currentServerTime } as const
}
