import clsx from "clsx"

import styles from "@/components/parts/button/InspiredSourceLinkButton/index.module.css"
import { Link } from "@/components/parts/Link"

/** Props */
type Props = {
  /** タイプ */
  type: "background" | "visual" | "font"
  /** アイコン */
  icon: string
  /** ラベル */
  label: string
  /** 遷移先 */
  href: string
}

/** InspiredByで使用するリンクボタン */
export const InspiredSourceLinkButton = ({ type, icon, label, href }: Props) => {
  const displayType = (type.charAt(0).toUpperCase() + type.slice(1)) as
    | "Background"
    | "Visual"
    | "Font"

  return (
    <Link className={styles.linkButton} href={href}>
      <img className={styles.icon} src={icon} />
      <div className={styles.right}>
        <div className={clsx(styles.type, styles[displayType])}>{displayType}</div>
        <span className={styles.label}>{label}</span>
      </div>
    </Link>
  )
}
