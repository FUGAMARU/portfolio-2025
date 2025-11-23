import clsx from "clsx"

import { WindowContainer } from "@/components/parts/window/WindowContainer"
import styles from "@/components/windows/WarnWindow/index.module.css"
import { WarnIcon } from "@/components/windows/WarnWindow/WarnIcon"

/** 環境要件を満たさない場合に表示する警告ウィンドウ */
export const WarnWindow = () => {
  return (
    <WindowContainer hasWindowControl={false} isFixed isFullScreen={false}>
      <div className={styles.warnWindow}>
        <div className={styles.upper}>
          <div className={styles.icon}>
            <WarnIcon />
          </div>

          <div className={styles.message}>
            <p className={styles.title}>ご利用の環境ではサイトを表示できません</p>
            <p className={styles.caption}>
              This site cannot be displayed in your current environment
            </p>
          </div>
        </div>

        <div className={styles.requirements}>
          <div className={styles.title}>必要環境</div>

          <div className={styles.info}>
            <span>画面サイズ</span>
            <span className={styles.divider} />
            <span>1200px×700px 以上</span>
          </div>
          <div className={clsx(styles.info, styles.Secondary)}>
            <span>ブラウザー</span>
            <span className={styles.divider} />
            <span>Chromium ベース</span>
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
