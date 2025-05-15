import clsx from "clsx"

import styles from "@/components/parts/window/WindowControl/index.module.css"

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
  // TODO: ホバーした時にアイコンが出るようにする
  return (
    <div className={styles.windowControl}>
      <button className={clsx(styles.button, styles.Close)} onClick={onClose} type="button" />
      <button className={clsx(styles.button, styles.Minimize)} onClick={onMinimize} type="button" />
      <button className={clsx(styles.button, styles.Maximize)} onClick={onMaximize} type="button" />
    </div>
  )
}
