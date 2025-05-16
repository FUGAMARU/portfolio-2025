import styles from "@/components/parts/button/WorkButton/index.module.css"

import type { ComponentProps } from "react"

/** Props */
type Props = Pick<ComponentProps<"button">, "onClick"> & Pick<ComponentProps<"img">, "src" | "alt">

/** 作品ボタン */
export const WorkButton = ({ onClick, ...imgProps }: Props) => {
  return (
    <button className={styles.workButton} onClick={onClick} type="button">
      <img className={styles.icon} {...imgProps} />
    </button>
  )
}
