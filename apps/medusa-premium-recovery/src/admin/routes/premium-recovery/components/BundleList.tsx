import React from "react"
import { Badge, Button, Container, Text } from "../../../../ui/vendor"

export type BundleInfo = {
  id: string
  name: string
  created_at: string
  created_by?: string
  size: string
  restore_ready?: boolean
  verified?: boolean
  portable?: boolean
}

type BundleListProps = {
  bundles: BundleInfo[]
  loading: boolean
  onDownload?: (bundle: BundleInfo) => void
  onDelete?: (bundle: BundleInfo) => void
  density?: "compact" | "normal" | "comfortable"
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("fa-IR")
  } catch {
    return dateStr
  }
}

const getBadges = (bundle: BundleInfo) =>
  [
    bundle.restore_ready && { label: "بازیابی", color: "green" as const },
    bundle.verified && { label: "تأیید", color: "blue" as const },
    bundle.portable && { label: "قابل حمل", color: "purple" as const },
  ].filter(Boolean) as { label: string; color: "green" | "blue" | "purple" }[]

export const BundleList = ({
  bundles,
  loading,
  onDownload,
  onDelete,
}: BundleListProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Container key={index} className="h-16 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!bundles.length) {
    return (
      <Container className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Text weight="plus">هیچ باندلی موجود نیست</Text>
          <Text size="small" className="text-ui-fg-muted">
            پس از ایجاد اسنپ‌شات، باندل قابل دانلود خواهد بود
          </Text>
        </div>
      </Container>
    )
  }

  return (
    <div className="space-y-2">
      {bundles.map((bundle) => (
        <Container key={bundle.id} className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Text weight="plus">{bundle.name}</Text>

                {getBadges(bundle).map((badge) => (
                  <Badge key={badge.label} color={badge.color}>
                    {badge.label}
                  </Badge>
                ))}
              </div>

              <Text size="small" className="text-ui-fg-muted">
                {formatDate(bundle.created_at)} • {bundle.size}
              </Text>
            </div>

            <div className="flex gap-2">
              {onDownload ? (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => onDownload(bundle)}
                >
                  دانلود
                </Button>
              ) : null}

              {onDelete ? (
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => onDele
                    te(bundle)}
                >
                  حذف
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      ))}
    </
  )
}

export default BundleList
