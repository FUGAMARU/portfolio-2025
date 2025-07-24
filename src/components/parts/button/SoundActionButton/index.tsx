import clsx from "clsx"

import styles from "@/components/parts/button/SoundActionButton/index.module.css"
import { SoundOffIcon } from "@/components/parts/button/SoundActionButton/SoundOffIcon"
import { SoundOnIcon } from "@/components/parts/button/SoundActionButton/SoundOnIcon"

import type { ComponentProps } from "react"

/** Props */
type Props = {
  /** 表示タイプ */
  displayType: "on" | "off"
} & Required<Pick<ComponentProps<"button">, "onClick">>

/** サウンドアクションボタン */
export const SoundActionButton = ({ displayType, onClick: handleClick }: Props) => {
  return (
    <button className={styles.soundActionButton} onClick={handleClick} type="button">
      <span className={clsx(styles.icon, displayType === "off" && styles.Larger)}>
        {displayType === "on" ? <SoundOnIcon /> : <SoundOffIcon />}
      </span>
      <span className={styles.text}>{displayType === "on" ? "Play" : "Mute"}</span>
    </button>
  )
}
