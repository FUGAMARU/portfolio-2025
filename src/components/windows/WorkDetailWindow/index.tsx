import { GeneralButton } from "@/components/parts/button/GeneralButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { ComponentProps } from "react"

import styles from "@/components/windows/WorkDetailWindow/index.module.css"

/** Props */
type Props = {
  /** プレビュー画像 */
  previewImage: string
  /** ロゴ画像 */
  logoImage: string
  /** タグ一覧 */
  tags: Array<string>
  /** 説明文 */
  description: string
  /** 参考リンク一覧 */
  referenceLinks: Array<{
    /** テキスト */
    text: string
    /** 遷移先 */
    href: string
  }>
} & Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMaximize" | "onMinimize"> &
  Pick<
    ComponentProps<typeof WindowContainer>,
    "left" | "top" | "onPositionChange" | "zIndex" | "onFocus"
  >

/** 作品詳細ウィンドウ */
export const WorkDetailWindow = ({ zIndex, onFocus, ...windowContainerProps }: Props) => {
  return (
    <WindowContainer
      hasWindowControl
      isFullScreen={false}
      onFocus={onFocus}
      zIndex={zIndex}
      {...windowContainerProps}
    >
      <div className={styles.workDetailWindow}>
        <img className={styles.preview} src={windowContainerProps.previewImage} width={500} />
        <div className={styles.info}>
          <img className={styles.logo} height={70} src={windowContainerProps.logoImage} />

          <div className={styles.tags}>
            {windowContainerProps.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>

          <p className={styles.description}>{windowContainerProps.description}</p>

          <div className={styles.links}>
            {windowContainerProps.referenceLinks.map((link, index) => (
              <GeneralButton key={index} href={link.href} text={link.text} />
            ))}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
