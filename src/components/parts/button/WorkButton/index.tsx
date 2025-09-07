import clsx from "clsx"

import styles from "@/components/parts/button/WorkButton/index.module.css"

import type { Work } from "@/hooks/useDataFetch"
import type { ComponentProps } from "react"

/** Props */
type Props = Pick<ComponentProps<"button">, "onClick" | "className"> &
  Pick<ComponentProps<"img">, "src" | "alt"> &
  Pick<Work, "logoScale">

/** 作品ボタン */
export const WorkButton = ({ onClick, className, logoScale = 1, ...imgProps }: Props) => {
  return (
    <button className={clsx(styles.workButton, className)} onClick={onClick} type="button">
      <img className={styles.icon} style={{ transform: `scale(${logoScale})` }} {...imgProps} />
    </button>
  )
}
