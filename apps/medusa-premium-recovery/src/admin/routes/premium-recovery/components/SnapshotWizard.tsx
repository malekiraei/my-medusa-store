import { useCallback, useEffect } from "react"

import {
  Badge,
  Button,
  Container,
  FocusModal,
  Heading,
  Text,
} from "../../../../ui/vendor"
import {
  CheckCircle2,
  FileClock,
  TriangleAlert,
} from "../../../../ui/vendor/lucide"
import { getExperienceView } from "../../../../ui/adapters/experience"
import { useSnapshotMachine } from "../hooks/useSnapshotMachine"
import { snapshotService } from "../services/snapshot.service"
import AnalyzingView from "../views/snapshot/AnalyzingView"
import MetadataView from "../views/snapshot/MetadataView"
import ReviewView from "../views/snapshot/ReviewView"
import SelectingView from "../views/snapshot/SelectingView"
import type {
  SnapshotCreatePayload,
  SnapshotUseCase,
} from "../types/snapshot-workflow"

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: SnapshotCreatePayload) => Promise<void>
  fetchGitFiles: () => Promise<any[]>
}

const progressWidthClass = (progress: number) => {
  if (progress >= 100) return "w-full"
  if (progress >= 90) return "w-[90%]"
  if (progress >= 75) return "w-3/4"
  if (progress >= 66) return "w-2/3"
  if (progress >= 50) return "w-1/2"
  if (progress >= 33) return "w-1/3"
  if (progress >= 25) return "w-1/4"
  if (progress > 0) return "w-1/6"
  return "w-0"
}

const stepItems = [
  { id: "selecting", label: "Files" },
  { id: "metadata", label: "Details" },
  { id: "review", label: "Review" },
]

const getStepIndex = (step: string) => {
  if (step === "metadata") return 1
  if (step === "review" || step === "creating" || step === "done") return 2
  return 0
}

const ProgressBlock = ({
  progress,
  label,
  step,
}: {
  progress: number
  label: string
  step: string
}) => {
  const currentStepIndex = getStepIndex(step)

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-x-3">
        {stepItems.map((item, index) => {
          const isActive = index === currentStepIndex
          const isComplete = index < currentStepIndex

          return (
            <div key={item.id} className="flex min-w-0 items-center gap-x-2">
              <span
                className={[
                  "flex size-5 items-center justify-center rounded-full border text-[10px] font-medium",
                  isActive || isComplete
                    ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color"
                    : "border-ui-border-base bg-ui-bg-base text-ui-fg-muted",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <Text
                size="small"
                leading="compact"
                className={isActive ? "text-ui-fg-base" : "text-ui-fg-muted"}
              >
                {item.label}
              </Text>
            </div>
          )
        })}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-ui-bg-subtle">
        <div
          className={[
            "h-full rounded-full bg-ui-bg-interactive transition-all duration-300",
            progressWidthClass(progress),
          ].join(" ")}
        />
      </div>

      <div className="flex items-center justify-between gap-x-3">
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          {label}
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          {Math.max(0, Math.min(100, progress))}%
        </Text>
      </div>
    </div>
  )
}

const StatusView = ({
  title,
  description,
  tone,
  primaryLabel,
  onPrimary,
  error,
}: {
  title: string
  description: string
  tone: "green" | "red" | "blue"
  primaryLabel: string
  onPrimary: () => void
  error?: string | null
}) => {
  const Icon = tone === "green" ? CheckCircle2 : tone === "red" ? TriangleAlert : FileClock

  return (
    <Container className="p-0">
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-y-5 px-6 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
          <Icon
            className={[
              "size-6",
              tone === "green" ? "text-ui-fg-success" : "",
              tone === "red" ? "text-ui-fg-error" : "",
              tone === "blue" ? "animate-spin text-ui-fg-subtle" : "",
            ].join(" ")}
          />
        </div>

        <div className="flex max-w-md flex-col gap-y-2">
          <Heading level="h2">{title}</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {description}
          </Text>
          {error ? (
            <Text size="small" leading="compact" className="text-ui-fg-error">
              {error}
            </Text>
          ) : null}
        </div>

        <Button variant="primary" onClick={onPrimary} disabled={tone === "blue"}>
          {primaryLabel}
        </Button>
      </div>
    </Container>
  )
}

export default function SnapshotWizard({
  isOpen,
  onClose,
  onCreate,
  fetchGitFiles,
}: Props) {
  const { state, send, open, close: closeMachine } = useSnapshotMachine({
    fetchFiles: fetchGitFiles,
    createSnapshot: async (data) => {
      const normalized = snapshotService.normalizePayload({
        name: data.name,
        description: data.description,
        businessContext: data.businessContext,
        useCase: data.useCase as SnapshotUseCase,
        files: data.files,
      })

      await onCreate(normalized)
    },
  })

  useEffect(() => {
    if (isOpen) {
      open()
      return
    }

    closeMachine()
  }, [isOpen, open, closeMachine])

  const wizardState = snapshotService.extractState(state)
  const {
    experienceState,
    step,
    files,
    selected,
    error,
    name,
    description,
    context,
    useCase,
    isAnalyzing,
    isCreating,
    isError,
    isDone,
  } = wizardState

  const ui = getExperienceView(experienceState)
  const canClose = !isAnalyzing && !isCreating

  const safeFiles = Array.isArray(files) ? files : []
  const safeSelected = Array.isArray(selected) ? selected : []
  const nextDisabled =
    ui.nextDisabled ||
    isCreating ||
    isAnalyzing ||
    (step === "selecting" && safeSelected.length === 0) ||
    (step === "metadata" && !name.trim())

  const handleClose = useCallback(() => {
    if (!canClose) {
      return
    }

    send({ type: "CLOSE" })
    onClose()
  }, [canClose, send, onClose])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        open()
        return
      }

      handleClose()
    },
    [open, handleClose]
  )

  const handleNext = useCallback(() => {
    if (step === "selecting" && safeSelected.length === 0) {
      return
    }

    if (step === "metadata" && !name.trim()) {
      return
    }

    if (step === "review") {
      send({ type: "CREATE" })
      return
    }

    send({ type: "NEXT" })
  }, [step, safeSelected.length, name, send])

  const handleBack = useCallback(() => {
    if (step === "selecting" || isCreating) {
      return
    }

    send({ type: "BACK" })
  }, [step, isCreating, send])

  const handleRetry = useCallback(() => {
    send({ type: "RETRY" })
  }, [send])

  const handleToggleFile = useCallback(
    (path: string) => {
      send({ type: "TOGGLE_FILE", path })
    },
    [send]
  )

  const handleSelectAll = useCallback(() => {
    send({ type: "SELECT_ALL" })
  }, [send])

  const handleSetName = useCallback(
    (snapshotName: string) => {
      send({ type: "SET_NAME", name: snapshotName })
    },
    [send]
  )

  const handleSetDescription = useCallback(
    (snapshotDescription: string) => {
      send({ type: "SET_DESCRIPTION", description: snapshotDescription })
    },
    [send]
  )

  const handleSetContext = useCallback(
    (businessContext: string) => {
      send({ type: "SET_BUSINESS_CONTEXT", context: businessContext })
    },
    [send]
  )

  const handleSetUseCase = useCallback(
    (snapshotUseCase: string) => {
      send({ type: "SET_USE_CASE", useCase: snapshotUseCase as SnapshotUseCase })
    },
    [send]
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!isOpen) {
        return
      }

      if (event.key === "Escape" && canClose && !isDone) {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key === "ArrowLeft" && ui.showBack) {
        event.preventDefault()
        handleBack()
        return
      }

      if (event.key === "ArrowRight" && !nextDisabled) {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [
    isOpen,
    canClose,
    isDone,
    ui.showBack,
    nextDisabled,
    handleClose,
    handleBack,
    handleNext,
  ])

  const renderView = () => {
    switch (experienceState) {
      case "analyzing":
        return (
          <AnalyzingView
            isFetching={step === "loading"}
            filesCount={safeFiles.length}
            error={error}
          />
        )

      case "selecting":
        return (
          <SelectingView
            files={safeFiles}
            selectedFiles={safeSelected}
            error={error}
            onToggleFile={handleToggleFile}
            onSelectAll={handleSelectAll}
            isAllSelected={
              safeFiles.length > 0 && safeSelected.length === safeFiles.length
            }
          />
        )

      case "metadata":
        return (
          <MetadataView
            snapshotName={name}
            snapshotDescription={description}
            snapshotBusinessContext={context}
            snapshotUseCase={useCase as SnapshotUseCase}
            selectedCount={safeSelected.length}
            onSetName={handleSetName}
            onSetDescription={handleSetDescription}
            onSetBusinessContext={handleSetContext}
            onSetUseCase={handleSetUseCase}
          />
        )

      case "review":
        return (
          <ReviewView
            snapshotName={name}
            snapshotDescription={description}
            snapshotBusinessContext={context}
            snapshotUseCase={useCase as SnapshotUseCase}
            selectedCount={safeSelected.length}
          />
        )

      case "creating":
        return (
          <StatusView
            title={ui.title}
            description={ui.description}
            tone="blue"
            primaryLabel="Creating..."
            onPrimary={() => undefined}
          />
        )

      case "done":
        return (
          <StatusView
            title={ui.title}
            description={ui.description}
            tone="green"
            primaryLabel="Close"
            onPrimary={handleClose}
          />
        )

      case "error":
        return (
          <StatusView
            title={ui.title}
            description={ui.description}
            tone="red"
            primaryLabel={ui.nextLabel}
            onPrimary={handleRetry}
            error={error}
          />
        )

      default:
        return null
    }
  }

  return (
    <FocusModal open={isOpen} onOpenChange={handleOpenChange}>
      <FocusModal.Content className="!fixed !left-1/2 !top-1/2 z-[1000] !h-[86vh] !max-h-[86vh] !w-[calc(100vw-2rem)] !max-w-[980px] !-translate-x-1/2 !-translate-y-1/2 overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base p-0 shadow-elevation-card-hover">
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-ui-bg-base">
          <FocusModal.Header>
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="flex min-w-0 items-center gap-x-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-ui-border-base bg-ui-bg-subtle shadow-elevation-card-rest">
                  <FileClock className="size-5 text-ui-fg-subtle" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Heading level="h2" id="wizard-title">
                      {ui.title}
                    </Heading>
                    {isCreating ? <Badge color="blue">Processing</Badge> : null}
                    {isDone ? <Badge color="green">Created</Badge> : null}
                    {isError ? <Badge color="red">Error</Badge> : null}
                  </div>

                  <Text size="small" leading="compact" className="mt-1 text-ui-fg-muted">
                    {ui.description}
                  </Text>
                </div>
              </div>

              <Button
                variant="secondary"
                size="small"
                onClick={handleClose}
                disabled={!canClose}
              >
                Close
              </Button>
            </div>
          </FocusModal.Header>

          {ui.showProgress && !isError && !isDone ? (
            <div className="border-b border-ui-border-base bg-ui-bg-subtle/40 px-6 py-4">
              <ProgressBlock
                progress={ui.progress}
                label={snapshotService.getStepLabel(experienceState)}
                step={step}
              />
            </div>
          ) : null}

          <FocusModal.Body className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {renderView()}
            </div>
          </FocusModal.Body>

          <FocusModal.Footer>
            <div className="flex w-full items-center justify-between gap-x-3">
              <Text size="small" leading="compact" className="text-ui-fg-muted">
                {safeSelected.length} selected
              </Text>

              <div className="flex items-center gap-x-2">
                {ui.showBack ? (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={handleBack}
                    disabled={isCreating}
                  >
                    {ui.backLabel}
                  </Button>
                ) : null}

                {isError ? (
                  <Button size="small" variant="secondary" onClick={handleRetry}>
                    {ui.nextLabel}
                  </Button>
                ) : null}

                {!isDone && !isError ? (
                  <Button
                    size="small"
                    variant="primary"
                    onClick={handleNext}
                    disabled={nextDisabled}
                  >
                    {ui.nextLabel}
                  </Button>
                ) : null}

                {isDone ? (
                  <Button size="small" variant="primary" onClick={handleClose}>
                    Close
                  </Button>
                ) : null}
              </div>
            </div>
          </FocusModal.Footer>
        </div>
      </FocusModal.Content>
    </FocusModal>
  )
}
