import { useEffect, useState } from "react"

import { CenterStarIcon } from "@/components/widgets/StarWidget/CenterStarIcon"
import styles from "@/components/widgets/StarWidget/index.module.css"
import { LeftStarIcon } from "@/components/widgets/StarWidget/LeftStarIcon"
import { RightStarIcon } from "@/components/widgets/StarWidget/RightStarIcon"
import { getResourceUrl } from "@/utils"

/**
 * 2桁ゼロ埋め
 *
 * @param value - 数値
 * @returns 2桁の文字列
 */
const pad2 = (value: number): string => String(value).padStart(2, "0")

/**
 * ISO文字列を 'YYYY-MM-DD hh:mm:ss AM/PM' に整形
 *
 * @param isoString - ISO形式の日時文字列
 * @returns 整形済みの日時文字列
 */
const formatDatetime = (isoString: string): string => {
  const parsed = new Date(isoString)

  const year = parsed.getFullYear()
  const month = pad2(parsed.getMonth() + 1)
  const day = pad2(parsed.getDate())

  let hours = parsed.getHours()
  const minutes = pad2(parsed.getMinutes())
  const seconds = pad2(parsed.getSeconds())
  const isPm = hours >= 12
  const suffix = isPm ? "PM" : "AM"
  hours = hours % 12
  if (hours === 0) {
    hours = 12
  }
  const hh = pad2(hours)

  return `${year}-${month}-${day} ${hh}:${minutes}:${seconds} ${suffix}`
}

/**
 * サーバから現在時刻を取得する
 *
 * @returns ISO形式の現在時刻文字列
 */
const fetchServerTime = async (): Promise<string> => {
  const response = await fetch(getResourceUrl("/time"))
  if (!response.ok) {
    return new Date().toISOString()
  }
  const rawText = (await response.text()).trim()
  const iso = rawText.replace(/^"|"$/g, "")
  return iso !== "" ? iso : new Date().toISOString()
}

/** 星アイコンのウィジェット */
export const StarWidget = () => {
  const [displayTime, setDisplayTime] = useState<string>("")

  useEffect(() => {
    let isDisposed = false
    let intervalId: ReturnType<typeof setInterval> | undefined
    ;(async () => {
      const serverIso = await fetchServerTime()
      const baseServerMs = new Date(serverIso).getTime()
      const baseClientMs = Date.now()

      /** 表示日時の更新 */
      const updateDisplayTime = () => {
        if (isDisposed) {
          return
        }
        const elapsed = Date.now() - baseClientMs
        const currentMs = baseServerMs + elapsed
        setDisplayTime(formatDatetime(new Date(currentMs).toISOString()))
      }

      updateDisplayTime()
      intervalId = setInterval(updateDisplayTime, 1000)
    })()

    return () => {
      isDisposed = true
      if (intervalId !== undefined) {
        clearInterval(intervalId)
      }
    }
  }, [])

  return (
    <div className={styles.starWidget}>
      <div className={styles.stars}>
        <div className={styles.round}>
          <span className={styles.icon}>
            <LeftStarIcon />
          </span>
        </div>

        <div className={styles.round}>
          <span className={styles.icon}>
            <CenterStarIcon />
          </span>
        </div>

        <div className={styles.round}>
          <span className={styles.icon}>
            <RightStarIcon />
          </span>
        </div>
      </div>

      <span className={styles.datetime}>{displayTime ?? ""}</span>
    </div>
  )
}
