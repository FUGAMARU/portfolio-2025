import { Link } from "@/components/parts/Link"

import { ExternalIcon } from "@/components/parts/button/WorkLinkButton/ExternalIcon"
import styles from "@/components/parts/button/WorkLinkButton/index.module.css"

/** Props */
type Props = {
  /** テキスト */
  text: string
  /** 遷移先 */
  href: string
}

/** 作品リンクボタン */
export const WorkLinkButton = ({ text, href }: Props) => {
  return (
    <Link className={styles.workLinkButton} href={href}>
      <span className={styles.text}>{text}</span>
      <span className={styles.icon}>
        <ExternalIcon />
      </span>
    </Link>
  )
}
