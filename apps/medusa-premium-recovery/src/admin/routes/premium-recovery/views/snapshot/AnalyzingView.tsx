import { Container, Text } from "../../../../../ui/vendor"
import { FileClock, LoaderCircle, TriangleAlert } from "../../../../../ui/vendor/lucide"
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
        icon={<LoaderCircle className={isFetching ? "size-4 animate-spin" : "size-4"} />}
        title="Checking workspace"
        subtitle={isFetching ? "Reading Git changes..." : `${filesCount} changed files found`}
        tone="blue"
      />

      <div className="flex-1 overflow-y-auto py-4">
        <Container className="p-0">
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-8 text-center">
            {isFetching ? (
              <>
                <div className="flex size-12 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                  <LoaderCircle className="size-5 animate-spin text-ui-fg-subtle" />
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
        </Container>
      </div>
    </div>
  )
}
