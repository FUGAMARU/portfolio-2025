import { ExternalIcon } from "@/components/parts/button/GeneralButton/ExternalIcon"
import styles from "@/components/parts/button/GeneralButton/index.module.css"
import { Link } from "@/components/parts/Link"

/** Props */
type Props = {
  /** テキスト */
  text: string
  /** 遷移先 */
  href: string
}

/** 汎用ボタン */
export const GeneralButton = ({ text, href }: Props) => {
  return (
    <Link className={styles.generalButton} href={href}>
      <span className={styles.text}>{text}</span>
      <span className={styles.icon}>
        <ExternalIcon />
      </span>
    </Link>
  )
}
