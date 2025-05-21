import { CheckMarkIcon } from "@/components/widgets/LoadingStatusWidget/CheckMarkIcon"
import styles from "@/components/widgets/LoadingStatusWidget/index.module.css"

/** ローディングステータスウィジェット */
export const LoadingStatusWidget = () => {
  return (
    <div className={styles.loadingStatusWidget}>
      <span className={styles.text}>All content loaded successfully</span>
      <span className={styles.icon}>
        <CheckMarkIcon />
      </span>
    </div>
  )
}
