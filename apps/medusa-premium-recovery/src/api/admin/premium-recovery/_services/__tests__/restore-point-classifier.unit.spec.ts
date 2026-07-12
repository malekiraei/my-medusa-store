import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { classifyRestorePoint } from "../restore-point-classifier"
import { sha256, type RestorePointSummary } from "../snapshot-manifest"

const withRestoreFixture = async (
  run: (workspaceRoot: string, restorePointDirectory: string) => Promise<void>
) => {
  const root = await mkdtemp(join(tmpdir(), "premium-recovery-readiness-"))
  const workspaceRoot = join(root, "workspace")
  const restorePointDirectory = join(root, "restore-point")

  try {
    await mkdir(join(workspaceRoot, "apps", "backend", "src"), { recursive: true })
    await mkdir(join(restorePointDirectory, "files"), { recursive: true })
    await writeFile(join(workspaceRoot, "apps", "backend", "package.json"), "{}")
    await run(workspaceRoot, restorePointDirectory)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

const makePoint = (overrides: Partial<RestorePointSummary>): RestorePointSummary => ({
  id: "point-1",
  hash: "hash",
  name: "Snapshot",
  description: "",
  business_context: "",
  use_case: "manual",
  created_at: new Date().toISOString(),
  files: [],
  manifest_files: [],
  files_count: 0,
  captured_files_count: 0,
  missing_files_count: 0,
  storage_path: ".premium-recovery/restore-points/point-1",
  ...overrides,
})

test("classifies a legacy but policy-valid captured snapshot with warnings", async () => {
  await withRestoreFixture(async (workspaceRoot, restorePointDirectory) => {
    const content = Buffer.from("export const ok = true\n")
    await writeFile(join(restorePointDirectory, "files", "api.ts"), content)

    const point = makePoint({
      files: ["apps/backend/src/api.ts"],
      manifest_files: [
        {
          path: "apps/backend/src/api.ts",
          status: "captured",
          snapshot_path: "files/api.ts",
          size: content.byteLength,
          sha256: sha256(content),
          missing_reason: null,
        },
      ],
      files_count: 1,
      captured_files_count: 1,
    })

    const readiness = await classifyRestorePoint({
      point,
      workspaceRoot,
      restorePointDirectory,
    })

    assert.equal(readiness.status, "Restorable with warnings")
    assert.equal(readiness.legacy_policy, true)
    assert.equal(readiness.restorable_files_count, 1)
  })
})

test("classifies forbidden legacy files as not restorable", async () => {
  await withRestoreFixture(async (workspaceRoot, restorePointDirectory) => {
    const content = Buffer.from("zip")
    await writeFile(join(restorePointDirectory, "files", "archive.zip"), content)

    const point = makePoint({
      files: ["apps/backend/src/archive.zip"],
      manifest_files: [
        {
          path: "apps/backend/src/archive.zip",
          status: "captured",
          snapshot_path: "files/archive.zip",
          size: content.byteLength,
          sha256: sha256(content),
          missing_reason: null,
        },
      ],
      files_count: 1,
      captured_files_count: 1,
    })

    const readiness = await classifyRestorePoint({
      point,
      workspaceRoot,
      restorePointDirectory,
    })

    assert.equal(readiness.status, "Not restorable")
    assert.equal(readiness.not_restorable_files_count, 1)
    assert.ok(readiness.reasons.some((reason) => reason.includes("policy_archive_file")))
  })
})

test("classifies blob hash mismatch as not restorable", async () => {
  await withRestoreFixture(async (workspaceRoot, restorePointDirectory) => {
    const content = Buffer.from("changed")
    await writeFile(join(restorePointDirectory, "files", "api.ts"), content)

    const point = makePoint({
      files: ["apps/backend/src/api.ts"],
      manifest_files: [
        {
          path: "apps/backend/src/api.ts",
          status: "captured",
          snapshot_path: "files/api.ts",
          size: content.byteLength,
          sha256: sha256("original"),
          missing_reason: null,
        },
      ],
      files_count: 1,
      captured_files_count: 1,
    })

    const readiness = await classifyRestorePoint({
      point,
      workspaceRoot,
      restorePointDirectory,
    })

    assert.equal(readiness.status, "Not restorable")
    assert.ok(readiness.reasons.some((reason) => reason.includes("blob_hash_mismatch")))
  })
})
