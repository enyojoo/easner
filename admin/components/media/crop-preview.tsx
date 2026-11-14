import { CROPS, cropRect, type CropName, type Focal } from "@/lib/blog/crops"
import { blogFileUrl } from "@/lib/supabase"

type Props = {
  path: string
  imgW: number
  imgH: number
  crop: CropName
  focal: Focal
  /** Rendered width in px; the height follows the crop's aspect ratio. */
  width: number
  label: string
}

/** One crop of the image, as the focal point produces it (share image, card and header, square). */
export function CropPreview({ path, imgW, imgH, crop, focal, width, label }: Props) {
  const spec = CROPS[crop]
  const rect = cropRect(imgW, imgH, spec.w / spec.h, focal)
  const scale = width / rect.w
  const height = width / (spec.w / spec.h)
  const url = blogFileUrl(path)
  return (
    <figure className="space-y-1.5">
      <div className="relative overflow-hidden rounded-md bg-muted ring-1 ring-border/60" style={{ width, height }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- Storage URL positioned as a crop.
          <img
            src={url}
            alt=""
            draggable={false}
            className="absolute max-w-none"
            style={{ width: imgW * scale, height: imgH * scale, left: -rect.x * scale, top: -rect.y * scale }}
          />
        ) : null}
      </div>
      <figcaption className="text-xs text-muted-foreground">{label}</figcaption>
    </figure>
  )
}
