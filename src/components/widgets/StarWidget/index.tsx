import { CenterStarIcon } from "@/components/widgets/StarWidget/CenterStarIcon"
import styles from "@/components/widgets/StarWidget/index.module.css"
import { LeftStarIcon } from "@/components/widgets/StarWidget/LeftStarIcon"
import { RightStarIcon } from "@/components/widgets/StarWidget/RightStarIcon"

/** 星アイコンのウィジェット */
export const StarWidget = () => {
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

      <span className={styles.datetime}>2025-05-13 01:38:13 AM</span>
    </div>
  )
}
