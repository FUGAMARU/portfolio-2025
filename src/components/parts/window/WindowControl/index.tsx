import clsx from "clsx"

import { CloseIcon } from "@/components/parts/window/WindowControl/CloseIcon"
import styles from "@/components/parts/window/WindowControl/index.module.css"
import { MaximizeIcon } from "@/components/parts/window/WindowControl/MaximizeIcon"
import { MinimizeIcon } from "@/components/parts/window/WindowControl/MinimizeIcon"

/** Props */
type Props = {
  /** 閉じるボタンを押下した時の処理 */
  onClose: () => void
  /** 最小化ボタンを押下した時の処理 */
  onMinimize: () => void
  /** 最大化ボタンを押下した時の処理 */
  onMaximize: () => void
}

/** ウィンドウ管理用パーツ */
export const WindowControl = ({ onClose, onMinimize, onMaximize }: Props) => {
  return (
    <div className={styles.windowControl}>
      <button className={clsx(styles.button, styles.Close)} onClick={onClose} type="button">
        <span className={styles.icon}>
          <CloseIcon />
        </span>
      </button>
      <button className={clsx(styles.button, styles.Minimize)} onClick={onMinimize} type="button">
        <span className={styles.icon}>
          <MinimizeIcon />
        </span>
      </button>
      <button className={clsx(styles.button, styles.Maximize)} onClick={onMaximize} type="button">
        <span className={styles.icon}>
          <MaximizeIcon />
        </span>
      </button>
    </div>
  )
}
