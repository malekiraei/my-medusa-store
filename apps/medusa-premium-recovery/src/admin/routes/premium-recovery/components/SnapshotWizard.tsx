// ============================================================
// SnapshotWizard - Medusa UI implementation
// Uses official Medusa UI primitives and semantic UI tokens.
// No inline styles, no custom SVG, no keyframes, no hardcoded colors,
// no arbitrary/dynamic Tailwind classes.
// ============================================================

import { useCallback, useEffect } from "react"
import { Badge, Button, Container, FocusModal, Heading, Text } from "../../../../ui/vendor"

import { useSnapshotMachine } from "../hooks/useSnapshotMachine"
import AnalyzingView from "../views/snapshot/AnalyzingView"
import SelectingView from "../views/snapshot/SelectingView"
import MetadataView from "../views/snapshot/MetadataView"
import ReviewView from "../views/snapshot/ReviewView"
import { getExperienceView } from "../../../../ui/adapters/experience"
import { snapshotService } from "../services/snapshot.service"
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

const normalizeProgressValue = (progress: string | number | undefined) => {
  if (typeof progress === "number") {
    return `${Math.max(0, Math.min(100, progress))}%`
  }

  if (!progress) {
    return "0%"
  }

  return progress
}

const ProgressBlock = ({
  progress,
  label,
}: {
  progress: string | number | undefined
  label: string
}) => {
  const safeProgress = normalizeProgressValue(progress)

  return (
    <div className="flex flex-col gap-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-ui-bg-subtle">
        <div
          className={[
            "h-full rounded-full bg-ui-fg-base transition-all",
            safeProgress === "0%" ? "w-0" : "",
            safeProgress === "25%" ? "w-1/4" : "",
            safeProgress === "50%" ? "w-1/2" : "",
            safeProgress === "75%" ? "w-3/4" : "",
            safeProgress === "100%" ? "w-full" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      <div className="flex items-center justify-between">
        <Text size="small" className="text-ui-fg-muted">
          {safeProgress}
        </Text>
        <Text size="small" className="text-ui-fg-muted">
          {label}
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
}: {
  title: string
  description: string
  tone: "green" | "red" | "blue"
  primaryLabel: string
  onPrimary: () => void
}) => {
  return (
    <Container className="p-0">
      <div className="flex flex-col items-center gap-y-4 px-6 py-8 text-center">
        <Badge color={tone}>{title}</Badge>

        <div className="flex flex-col gap-y-1">
          <Heading level="h2">{title}</Heading>
          <Text size="small" className="text-ui-fg-muted">
            {description}
          </Text>
        </div>

        <Button variant="primary" onClick={onPrimary}>
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
    if (step === "selecting") {
      return
    }

    send({ type: "BACK" })
  }, [step, send])

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
      send({ type: "SET_USE_CASE", useCase: snapshotUseCase })
    },
    [send]
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!isOpen) {
        return
      }

      if (event.key === "Escape" && !isAnalyzing && !isCreating && !isDone) {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key === "ArrowLeft" && ui.showBack) {
        event.preventDefault()
        handleBack()
        return
      }

      if (event.key === "ArrowRight" && !ui.nextDisabled) {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [
    isOpen,
    isAnalyzing,
    isCreating,
    isDone,
    ui.showBack,
    ui.nextDisabled,
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
            primaryLabel="در حال ایجاد..."
            onPrimary={() => undefined}
          />
        )

      case "done":
        return (
          <StatusView
            title={ui.title}
            description={ui.description}
            tone="green"
            primaryLabel="بستن"
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
          />
        )

      default:
        return null
    }
  }

  return (
    <FocusModal open={isOpen} onOpenChange={handleOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <div className="flex w-full items-center justify-between gap-x-4">
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center gap-x-2">
                <Heading level="h2" id="wizard-title">
                  {ui.title}
                </Heading>
                {isCreating && <Badge color="blue">در حال پردازش</Badge>}
                {isDone && <Badge color="green">کامل شد</Badge>}
                {isError && <Badge color="red">خطا</Badge>}
              </div>

              <Text size="small" className="text-ui-fg-muted">
                {ui.description}
              </Text>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={handleClose}
              disabled={!canClose}
            >
              بستن
            </Button>
          </div>
        </FocusModal.Header>

        <FocusModal.Body className="flex flex-1 flex-col overflow-hidden">
          {ui.showProgress && !isError && !isDone && (
            <div className="border-b border-ui-border-base px-6 py-4">
              <ProgressBlock
                progress={ui.progress}
                label={snapshotService.getStepLabel(experienceState)}
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6">{renderView()}</div>
          </div>
        </FocusModal.Body>

        {ui.showProgress && !isError && !isDone && (
          <FocusModal.Footer>
            <div className="flex w-full items-center justify-between gap-x-3">
              <div>
                <Text size="small" className="text-ui-fg-muted">
                  {safeSelected.length} فایل انتخاب شده
                </Text>
              </div>

              <div className="flex items-center gap-x-2">
                {ui.showBack && (
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    disabled={isCreating}
                  >
                    {ui.backLabel}
                  </Button>
                )}

                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={ui.nextDisabled || isCreating}
                >
                  {ui.nextLabel}
                </Button>
              </div>
            </div>
          </FocusModal.Footer>
        )}
      </FocusModal.Content>
    </FocusModal>
  )
}
