import type { ComponentProps, ReactNode } from "react"

/** Props */
type Props = Omit<ComponentProps<"a">, "rel" | "target"> & {
  /** children */
  children: ReactNode
}

/** リンクコンポーネント */
export const Link = ({ children, ...props }: Props) => {
  return (
    <a rel="noopener noreferrer" target="_blank" {...props}>
      {children}
    </a>
  )
}
