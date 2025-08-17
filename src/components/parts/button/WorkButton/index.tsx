import clsx from "clsx"

import styles from "@/components/parts/button/WorkButton/index.module.css"

import type { ComponentProps } from "react"

/** Props */
type Props = Pick<ComponentProps<"button">, "onClick" | "className"> &
  Pick<ComponentProps<"img">, "src" | "alt">

/** 作品ボタン */
export const WorkButton = ({ onClick, className, ...imgProps }: Props) => {
  return (
    <button className={clsx(styles.workButton, className)} onClick={onClick} type="button">
      <img className={styles.icon} {...imgProps} />
    </button>
  )
}
