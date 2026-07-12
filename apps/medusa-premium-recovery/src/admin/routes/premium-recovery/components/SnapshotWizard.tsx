import { useCallback, useEffect, useState } from "react"

import {
  Badge,
  Button,
  FocusModal,
  Text,
} from "../../../../ui/vendor"
import {
  CheckCircle2,
  FileClock,
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

const WizardHeader = ({
  title,
  context,
  step,
  canClose,
  isCreating,
  isError,
  onClose,
}: {
  title: string
  context: string
  step: string
  canClose: boolean
  isCreating: boolean
  isError: boolean
  onClose: () => void
}) => {
  const currentStepIndex = getStepIndex(step)
  const progressWidth = `${((currentStepIndex + 1) / stepItems.length) * 100}%`

  return (
    <div className="border-b border-ui-border-base bg-ui-bg-base">
      <div className="flex items-start justify-between gap-x-4 px-5 pb-4 pt-5">
        <div className="flex min-w-0 items-center gap-x-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-ui-border-base bg-ui-bg-component shadow-elevation-card-rest">
            <FileClock className="size-4 text-ui-fg-base" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Text
                size="small"
                leading="compact"
                weight="plus"
                id="wizard-title"
                className="text-xl"
              >
                {title}
              </Text>
              {isCreating ? <Badge color="green">Processing</Badge> : null}
              {isError ? <Badge color="red">Error</Badge> : null}
            </div>

            <Text size="small" leading="compact" className="mt-1 text-ui-fg-muted">
              {context}
            </Text>
          </div>
        </div>

        <Button
          variant="secondary"
          size="small"
          onClick={onClose}
          disabled={!canClose}
          className="shrink-0"
        >
          Close
        </Button>
      </div>

      <div
        className="relative -mx-px h-9 w-[calc(100%+2px)] overflow-hidden bg-ui-bg-field"
        aria-label="Snapshot wizard progress"
      >
        <div
          className="absolute inset-y-0 start-0 bg-ui-fg-base shadow-[0_0_22px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-[width] duration-500 ease-out"
          style={{ width: progressWidth }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 start-0 bg-gradient-to-r from-transparent via-ui-bg-base/20 to-transparent opacity-60 transition-[width] duration-500 ease-out"
          style={{ width: progressWidth }}
        />

        <div className="relative z-10 grid h-full grid-cols-3">
          {stepItems.map((item, index) => {
            const isFilled = index <= currentStepIndex
            const isActive = index === currentStepIndex
            const isComplete = index < currentStepIndex

            return (
              <div
                key={item.id}
                className={[
                  "flex h-full items-center justify-center gap-x-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300",
                  isFilled ? "text-ui-bg-base" : "text-ui-fg-muted",
                  isActive ? "drop-shadow-sm" : "",
                ].join(" ")}
                aria-current={isActive ? "step" : undefined}
              >
                {isComplete ? <CheckCircle2 className="size-3" /> : null}
                {item.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
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

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
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
  const headerContext =
    step === "selecting"
      ? `${safeFiles.length} changed files found - ${safeSelected.length} selected`
      : step === "metadata"
        ? `${safeSelected.length} selected files will be captured`
        : step === "review" || step === "creating"
          ? `${safeSelected.length} selected files ready for capture`
          : ui.description
  const nextDisabled =
    ui.nextDisabled ||
    isCreating ||
    isAnalyzing ||
    (step === "selecting" && safeSelected.length === 0) ||
    (step === "metadata" && !name.trim())
  const isFileSelectionStep = experienceState === "selecting"

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

  useEffect(() => {
    if (!isDone) {
      return
    }

    setSuccessMessage("Snapshot record created.")
    send({ type: "CLOSE" })
    onClose()
  }, [isDone, send, onClose])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 2600)

    return () => window.clearTimeout(timeout)
  }, [successMessage])

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
          <AnalyzingView
            isFetching
            filesCount={safeSelected.length}
            error={null}
          />
        )

      case "error":
        return (
          <AnalyzingView
            isFetching={false}
            filesCount={safeFiles.length}
            error={error || ui.description}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      <FocusModal open={isOpen} onOpenChange={handleOpenChange}>
        <FocusModal.Content className="!fixed !left-1/2 !top-1/2 z-[1000] !h-[84vh] !max-h-[84vh] !w-[calc(100vw-2rem)] !max-w-[940px] !-translate-x-1/2 !-translate-y-1/2 overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-base p-0 shadow-elevation-card-hover ring-1 ring-ui-border-base">
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-ui-bg-base">
            <WizardHeader
              title={ui.title}
              context={headerContext}
              step={step}
              canClose={canClose}
              isCreating={isCreating}
              isError={isError}
              onClose={handleClose}
            />

            <FocusModal.Body
              className={[
                "min-h-0 flex-1 p-0",
                isFileSelectionStep ? "overflow-y-auto" : "overflow-hidden",
              ].join(" ")}
            >
              <div
                className={[
                  "px-5",
                  isFileSelectionStep ? "min-h-full" : "h-full min-h-0",
                ].join(" ")}
              >
                {renderView()}
              </div>
            </FocusModal.Body>

            <FocusModal.Footer>
              <div className="flex w-full items-center justify-between gap-x-3 py-0.5">
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
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={handleRetry}
                    >
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
                </div>
              </div>
            </FocusModal.Footer>
          </div>
        </FocusModal.Content>
      </FocusModal>

      {successMessage ? (
        <div className="fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-lg border border-ui-border-base bg-ui-bg-base px-4 py-3 text-sm shadow-elevation-card-hover">
          {successMessage}
        </div>
      ) : null}
    </>
  )
}
