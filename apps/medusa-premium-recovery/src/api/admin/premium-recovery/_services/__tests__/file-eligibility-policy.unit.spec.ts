import test from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { tmpdir } from "node:os"

import {
  SNAPSHOT_FILE_POLICY_VERSION,
  evaluateSnapshotPath,
  evaluateSnapshotPaths,
} from "../file-eligibility-policy"

const withWorkspace = async (run: (workspaceRoot: string) => Promise<void>) => {
  const workspaceRoot = await mkdtemp(join(tmpdir(), "premium-recovery-policy-"))

  try {
    await mkdir(join(workspaceRoot, "apps", "backend", "src"), { recursive: true })
    await mkdir(join(workspaceRoot, "apps", "storefront", "src"), { recursive: true })
    await mkdir(join(workspaceRoot, "apps", "storefront", "public"), { recursive: true })
    await mkdir(join(workspaceRoot, "apps", "custom-plugin", "src"), { recursive: true })
    await writeFile(join(workspaceRoot, "package.json"), "{}")
    await writeFile(join(workspaceRoot, "pnpm-lock.yaml"), "lockfileVersion: 9")
    await writeFile(join(workspaceRoot, "apps", "backend", "package.json"), "{}")
    await writeFile(join(workspaceRoot, "apps", "storefront", "package.json"), "{}")
    await writeFile(join(workspaceRoot, "apps", "custom-plugin", "package.json"), "{}")
    await run(workspaceRoot)
  } finally {
    await rm(workspaceRoot, { recursive: true, force: true })
  }
}

test("allows development files across backend, storefront, plugins, and root config", async () => {
  await withWorkspace(async (workspaceRoot) => {
    const files = [
      ["apps/backend/src/api.ts", "backend-source"],
      ["apps/storefront/src/page.tsx", "storefront-source"],
      ["apps/custom-plugin/src/plugin.ts", "plugin-source"],
      ["package.json", "workspace-config"],
      ["pnpm-lock.yaml", "workspace-config"],
    ] as const

    for (const [path, scope] of files) {
      await writeFile(join(workspaceRoot, path), "export const ok = true\n")
      const decision = await evaluateSnapshotPath({ workspaceRoot, selectedPath: path })

      assert.equal(decision.eligible, true)
      assert.equal(decision.scope, scope)
      assert.equal(decision.policy_version, SNAPSHOT_FILE_POLICY_VERSION)
    }
  })
})

test("allows markdown only inside valid development scopes", async () => {
  await withWorkspace(async (workspaceRoot) => {
    await writeFile(join(workspaceRoot, "apps", "custom-plugin", "src", "README.md"), "# plugin")
    await mkdir(join(workspaceRoot, "ZCode", "reports"), { recursive: true })
    await writeFile(join(workspaceRoot, "ZCode", "reports", "README.md"), "# report")

    const validDoc = await evaluateSnapshotPath({
      workspaceRoot,
      selectedPath: "apps/custom-plugin/src/README.md",
    })
    const report = await evaluateSnapshotPath({
      workspaceRoot,
      selectedPath: "ZCode/reports/README.md",
    })

    assert.equal(validDoc.eligible, true)
    assert.equal(validDoc.file_kind, "documentation")
    assert.equal(report.eligible, false)
    assert.equal(report.reason_code, "runtime_file")
  })
})

test("rejects security-sensitive and generated paths", async () => {
  await withWorkspace(async (workspaceRoot) => {
    const rejected = [
      ["apps/backend/.env", "secret_file"],
      ["apps/backend/src/secret.key", "secret_file"],
      ["apps/backend/src/archive.zip", "archive_file"],
      ["apps/backend/src/store.sqlite", "database_file"],
      ["apps/backend/src/app.log", "runtime_file"],
      ["apps/backend/dist/server.ts", "denied_path"],
      ["apps/backend/node_modules/pkg/index.ts", "denied_path"],
      [resolve(workspaceRoot, "apps/backend/src/api.ts"), "absolute_path"],
      ["../outside.ts", "path_traversal"],
      ["apps/backend/src/%2e%2e/.env", "path_traversal"],
    ] as const

    for (const [path, reason] of rejected) {
      const decision = await evaluateSnapshotPath({ workspaceRoot, selectedPath: path })

      assert.equal(decision.eligible, false, path)
      assert.equal(decision.reason_code, reason, path)
    }
  })
})

test("rejects a mixed snapshot request without approving partial input", async () => {
  await withWorkspace(async (workspaceRoot) => {
    await writeFile(join(workspaceRoot, "apps/backend/src/api.ts"), "export const ok = true\n")
    await writeFile(join(workspaceRoot, "apps/backend/.env"), "SECRET=value\n")

    const result = await evaluateSnapshotPaths({
      workspaceRoot,
      selectedPaths: [
        "apps/backend/src/api.ts",
        "apps/backend/.env",
      ],
    })

    assert.equal(result.valid, false)
    assert.equal(result.approved.length, 0)
    assert.equal(result.rejected.length, 1)
    assert.equal(result.rejected[0].reason_code, "secret_file")
  })
})

test("rejects symlinks when the platform allows fixture creation", async () => {
  await withWorkspace(async (workspaceRoot) => {
    await writeFile(join(workspaceRoot, "apps/backend/src/real.ts"), "export const ok = true\n")

    try {
      await symlink(
        join(workspaceRoot, "apps/backend/src/real.ts"),
        join(workspaceRoot, "apps/backend/src/link.ts")
      )
    } catch {
      return
    }

    const decision = await evaluateSnapshotPath({
      workspaceRoot,
      selectedPath: "apps/backend/src/link.ts",
    })

    assert.equal(decision.eligible, false)
    assert.equal(decision.reason_code, "symlink")
  })
})
