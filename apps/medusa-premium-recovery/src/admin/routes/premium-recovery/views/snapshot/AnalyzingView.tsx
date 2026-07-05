import { Container, Text } from "../../../../../ui/vendor"
import { FileClock, RefreshCw, TriangleAlert } from "../../../../../ui/vendor/lucide"
import { ViewHeader } from "./ViewHeader"

type Props = {
  isFetching: boolean
  filesCount: number
  error: string | null
}

export default function AnalyzingView({ isFetching, filesCount, error }: Props) {
  return (
    <div className="flex h-full flex-col">
      <ViewHeader
        icon={<RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} />}
        title="بررسی تغییرات"
        subtitle={
          isFetching
            ? "در حال بررسی مخزن..."
            : `${filesCount} فایل یافت شد`
        }
        tone="blue"
      />

      <div className="flex-1 overflow-y-auto py-4">
        <Container className="p-0">
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-8 text-center">
            {isFetching ? (
              <>
                <div className="flex size-12 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                  <RefreshCw className="size-5 animate-spin text-ui-fg-subtle" />
                </div>
                <Text size="small" leading="compact" className="mt-4 text-ui-fg-subtle">
                  در حال بررسی فایل‌های Git...
                </Text>
              </>
            ) : error ? (
              <>
                <div className="flex size-12 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                  <TriangleAlert className="size-5 text-ui-fg-error" />
                </div>
                <Text size="small" leading="compact" className="mt-4 max-w-md text-ui-fg-error">
                  {error}
                </Text>
              </>
            ) : (
              <>
                <div className="flex size-12 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                  <FileClock className="size-5 text-ui-fg-subtle" />
                </div>
                <Text size="small" leading="compact" weight="plus" className="mt-4">
                  {filesCount} فایل یافت شد
                </Text>
                <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
                  آماده برای انتخاب
                </Text>
              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  )
}
