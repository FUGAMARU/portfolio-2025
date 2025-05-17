import styles from "@/components/parts/button/BadgeLinkButton/index.module.css"
import { Link } from "@/components/parts/Link"

import type { ComponentProps } from "react"

/** Props */
type Props = Required<
  Pick<ComponentProps<typeof Link>, "href"> & Pick<ComponentProps<"img">, "src" | "alt" | "height">
>

/** バッジリンクコンポーネント */
export const BadgeLinkButton = ({ href, src, alt, height }: Props) => {
  return (
    <Link className={styles.badgeLinkButton} href={href}>
      <img alt={alt} height={height} src={src} />
    </Link>
  )
}
