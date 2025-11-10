import clsx from "clsx"

import styles from "@/components/parts/ProgressBar/index.module.css"

/** Props */
type Props = {
  /** 進捗率 (0-100%) */
  progress: number
  /** イージングありかどうか */
  hasEasing?: true
}

/** プログレスバー */
export const ProgressBar = ({ progress, hasEasing }: Props) => {
  return (
    <div className={styles.progressBar}>
      <div
        className={clsx(styles.current, hasEasing && styles.HasEasing)}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
