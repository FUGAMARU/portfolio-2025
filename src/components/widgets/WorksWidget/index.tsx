import clsx from "clsx"
import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useState } from "react"

import { WorkButton } from "@/components/parts/button/WorkButton"
import styles from "@/components/widgets/WorksWidget/index.module.css"
import { getResourceUrl } from "@/utils"

import type { Work } from "@/hooks/useDataFetch"

/** カルーセル1ページあたりのアイテム数 */
const ITEM_COUNT_PER_PAGE = 6

/** Props */
type Props = {
  /** 作品ボタンを押下したときの処理 */
  onWorkButtonClick: (workId: string) => void
  /** 作品データ */
  worksData: Array<Pick<Work, "id" | "buttonImage" | "logoScale">>
  /** 初期表示時のアニメーションを適用するかどうか */
  shouldAppear?: boolean
}

/** 制作物一覧表示用ウィジェット */
export const WorksWidget = ({
  onWorkButtonClick: handleWorkButtonClick,
  worksData,
  shouldAppear = true
}: Props) => {
  const [viewportRef, emblaApi] = useEmblaCarousel({ align: "start" })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const pages = Array.from({ length: Math.ceil(worksData.length / ITEM_COUNT_PER_PAGE) }, (_, i) =>
    worksData.slice(i * ITEM_COUNT_PER_PAGE, (i + 1) * ITEM_COUNT_PER_PAGE)
  )

  useEffect(() => {
    if (emblaApi === undefined) {
      return
    }

    /** Embla の現在インデックスを state に反映 */
    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", handleSelect)
    handleSelect()

    return () => {
      emblaApi.off("select", handleSelect)
    }
  }, [emblaApi])

  return (
    <div className={styles.worksWidget}>
      <div className={styles.wrapper}>
        <button
          className={clsx(styles.button, styles.Prev)}
          disabled={selectedIndex === 0}
          onClick={() => emblaApi?.scrollPrev()}
          type="button"
        >
          Prev
        </button>

        <div ref={viewportRef} className={styles.viewport}>
          <div className={styles.track}>
            {pages.map(page => (
              <div key={page.map(w => w.id).join("-")} className={styles.slide}>
                <div className={styles.grid}>
                  {page.map(work => (
                    <div key={work.id} className={styles.item}>
                      <WorkButton
                        className={clsx(shouldAppear ? styles.AppearShown : styles.AppearHidden)}
                        logoScale={work.logoScale}
                        onClick={() => handleWorkButtonClick(work.id)}
                        src={getResourceUrl(work.buttonImage)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={clsx(styles.button, styles.Next)}
          disabled={selectedIndex === pages.length - 1}
          onClick={() => emblaApi?.scrollNext()}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  )
}
