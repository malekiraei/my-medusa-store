import { Text } from "../../../../../ui/vendor"
import { FileClock, TriangleAlert } from "../../../../../ui/vendor/lucide"

type Props = {
  isFetching: boolean
  filesCount: number
  error: string | null
}

export default function AnalyzingView({ isFetching, filesCount, error }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center">
      <div>
        <div className="flex min-h-56 flex-col items-center justify-center px-6 py-8 text-center">
          {isFetching ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                <FileClock className="size-5 animate-spin text-ui-fg-subtle" />
              </div>
              <Text size="small" leading="compact" className="mt-4 text-ui-fg-subtle">
                Checking changed files in the current workspace.
              </Text>
            </>
          ) : error ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                <TriangleAlert className="size-5 text-ui-fg-error" />
              </div>
              <Text size="small" leading="compact" className="mt-4 max-w-md text-ui-fg-error">
                {error}
              </Text>
            </>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                <FileClock className="size-5 text-ui-fg-subtle" />
              </div>
              <Text size="small" leading="compact" weight="plus" className="mt-4">
                {filesCount} changed files found
              </Text>
              <Text size="small" leading="compact" className="mt-1 text-ui-fg-subtle">
                Continue by selecting the files to capture.
              </Text>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
