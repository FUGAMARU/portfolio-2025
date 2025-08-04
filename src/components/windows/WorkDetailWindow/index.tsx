import { WorkLinkButton } from "@/components/parts/button/WorkLinkButton"
import { WindowContainer } from "@/components/parts/window/WindowContainer"
import styles from "@/components/windows/WorkDetailWindow/index.module.css"
import { getUrl } from "@/utils"

import type { WindowControl } from "@/components/parts/window/WindowControl"
import type { Work } from "@/hooks/useDataFetch"
import type { ComponentProps } from "react"

/** Props */
type Props = Work &
  Pick<ComponentProps<typeof WindowControl>, "onClose" | "onMaximize" | "onMinimize"> &
  Pick<
    ComponentProps<typeof WindowContainer>,
    "left" | "top" | "onPositionChange" | "zIndex" | "onFocus"
  >

/** 作品詳細ウィンドウ */
export const WorkDetailWindow = ({ zIndex, onFocus, ...windowContainerProps }: Props) => {
  return (
    <WindowContainer
      hasWindowControl
      isFixed={false}
      isFullScreen={false}
      onFocus={onFocus}
      zIndex={zIndex}
      {...windowContainerProps}
    >
      <div className={styles.workDetailWindow}>
        <div className={styles.preview}>
          <img
            className={styles.image}
            src={getUrl(windowContainerProps.previewImage)}
            width={500}
          />
        </div>
        <div className={styles.info}>
          <img className={styles.logo} height={70} src={getUrl(windowContainerProps.logoImage)} />

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
              <WorkLinkButton key={index} href={link.href} text={link.text} />
            ))}
          </div>
        </div>
      </div>
    </WindowContainer>
  )
}
