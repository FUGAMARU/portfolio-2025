import styles from "@/components/widgets/InspiredByWidget/index.module.css"
import { InfoIcon } from "@/components/widgets/InspiredByWidget/InfoIcon"

import type { ComponentProps } from "react"

/** Props */
type Props = Pick<ComponentProps<"button">, "onClick">

/** InspiredByウィジェット */
export const InspiredBy = ({ onClick }: Props) => {
  return (
    <button className={styles.inspiredByWidget} onClick={onClick} type="button">
      <span className={styles.icon}>
        <InfoIcon />
      </span>
      <span className={styles.label}>Inspired by</span>
    </button>
  )
}
