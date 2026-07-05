import type { ComponentProps } from "react"
import { useCallback, useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"

import { Container, Heading } from "../../../ui/vendor"
import { ShieldCheck } from "../../../ui/vendor/lucide"
import DashboardCards from "./components/DashboardCards"
import RecoveryOverview from "./components/RecoveryOverview"
import RestoreTimeline from "./components/RestoreTimeline"
import SnapshotWizard from "./components/SnapshotWizard"
import { useBundles } from "./hooks/useBundles"
import { useGitChanges } from "./hooks/useGitChanges"
import { useRecoveryStatus } from "./hooks/useRecoveryStatus"
import { useRestorePoints } from "./hooks/useRestorePoints"
import { fetchGitFilesWithRetry } from "./services/git.service"

const PremiumRecoveryIcon = (props: ComponentProps<typeof ShieldCheck>) => (
  <ShieldCheck {...props} strokeWidth={1.75} />
)

export const config = defineRouteConfig({
  label: "Premium Recovery",
  icon: PremiumRecoveryIcon,
})

const PremiumRecoveryPage = () => {
  const [isSnapshotWizardOpen, setIsSnapshotWizardOpen] = useState(false)
  const recoveryStatus = useRecoveryStatus()
  const gitChanges = useGitChanges()
  const restorePoints = useRestorePoints()
  const bundles = useBundles()

  useEffect(() => {
    void gitChanges.fetchChanges()
  }, [gitChanges.fetchChanges])

  const status = recoveryStatus.loading
    ? "unknown"
    : recoveryStatus.status?.protection_level ?? "unknown"
  const statusLabel = recoveryStatus.loading
    ? "Checking status"
    : recoveryStatus.error
      ? "Status unavailable"
      : undefined
  const statusDescription = recoveryStatus.loading
    ? "Recovery status is being checked."
    : recoveryStatus.error
      ? "The recovery status endpoint could not be resolved."
      : recoveryStatus.status?.protection_message || undefined
  const lastSyncText = recoveryStatus.status
    ? `Git branch: ${recoveryStatus.status.branch}`
    : "Status will update after the next check"
  const changedFiles = recoveryStatus.status
    ? recoveryStatus.status.changed_files_count
    : !gitChanges.loading && !gitChanges.error
      ? gitChanges.files.length
      : undefined
  const restorePointCount = !restorePoints.loading && !restorePoints.error
    ? restorePoints.points.length
    : undefined
  const bundleCount = recoveryStatus.status
    ? recoveryStatus.status.bundle_count
    : !bundles.loading && !bundles.error
      ? bundles.bundles.length
      : undefined

  const fetchSnapshotFiles = useCallback(async () => {
    const result = await fetchGitFilesWithRetry()

    if (result.error) {
      throw new Error(result.error)
    }

    return result.files
  }, [])

  const handleCreateSnapshot = useCallback(
    async (data: Parameters<typeof restorePoints.createPoint>[0]) => {
      const result = await restorePoints.createPoint(data)

      if (!result.success) {
        throw new Error(result.error || "Failed to create restore point")
      }
    },
    [restorePoints.createPoint]
  )

  return (
    <Container className="space-y-4 p-3 sm:p-4">
      <Heading level="h1" className="sr-only">
        Premium Recovery
      </Heading>

      <DashboardCards
        restorePoints={restorePointCount}
        bundles={bundleCount}
        changedFiles={changedFiles}
        status={status}
        statusLabel={statusLabel}
        statusDescription={statusDescription}
        lastSyncText={lastSyncText}
        onQuickCheck={recoveryStatus.refetch}
        onCreateSnapshot={() => setIsSnapshotWizardOpen(true)}
        overview={
          <RecoveryOverview
            status={status}
            changedFiles={changedFiles}
            restorePoints={restorePointCount}
            bundles={bundleCount}
            gitAvailable={recoveryStatus.status?.git_available}
            gitClean={recoveryStatus.status?.is_clean}
          />
        }
      />

      <RestoreTimeline
        points={restorePoints.points}
        loading={restorePoints.loading}
      />

      <SnapshotWizard
        isOpen={isSnapshotWizardOpen}
        onClose={() => setIsSnapshotWizardOpen(false)}
        onCreate={handleCreateSnapshot}
        fetchGitFiles={fetchSnapshotFiles}
      />
    </Container>
  )
}

export default PremiumRecoveryPage
