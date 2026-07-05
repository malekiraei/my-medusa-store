import { useCallback, useRef, useState } from "react"

import type {
  SnapshotWorkflowEvent,
  SnapshotWorkflowState,
} from "../types/snapshot-workflow"

type SnapshotServices = {
  fetchFiles: () => Promise<any[]>
  createSnapshot: (data: any) => Promise<void>
}

const initialState: SnapshotWorkflowState = {
  status: "idle",
  files: [],
  selectedFiles: [],
  name: "",
  description: "",
  businessContext: "",
  useCase: "manual",
  error: null,
}

export const useSnapshotMachine = (services: SnapshotServices) => {
  const [state, setState] = useState<SnapshotWorkflowState>(initialState)
  const servicesRef = useRef(services)
  const requestRef = useRef(0)

  servicesRef.current = services

  const loadFiles = useCallback(async () => {
    const requestId = ++requestRef.current

    setState({
      ...initialState,
      status: "loading",
    })

    try {
      const files = await servicesRef.current.fetchFiles()

      if (requestId !== requestRef.current) {
        return
      }

      setState({
        ...initialState,
        status: "selecting",
        files: Array.isArray(files) ? files : [],
      })
    } catch (error) {
      if (requestId !== requestRef.current) {
        return
      }

      setState({
        ...initialState,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to fetch files",
      })
    }
  }, [])

  const close = useCallback(() => {
    requestRef.current++
    setState(initialState)
  }, [])

  const send = useCallback((event: SnapshotWorkflowEvent) => {
    const type = event?.type

    if (type === "OPEN" || type === "RETRY") {
      void loadFiles()
      return
    }

    if (type === "CLOSE") {
      close()
      return
    }

    if (type === "CREATE") {
      setState((current) => {
        if (current.status !== "review") {
          return current
        }

        const snapshotData = {
          name: current.name,
          description: current.description,
          businessContext: current.businessContext,
          useCase: current.useCase,
          files: current.selectedFiles,
        }

        void servicesRef.current
          .createSnapshot(snapshotData)
          .then(() => {
            setState((latest) =>
              latest.status === "creating"
                ? { ...latest, status: "done", error: null }
                : latest
            )
          })
          .catch((error) => {
            setState((latest) =>
              latest.status === "creating"
                ? {
                    ...latest,
                    status: "error",
                    error:
                      error instanceof Error
                        ? error.message
                        : "Failed to create snapshot",
                  }
                : latest
            )
          })

        return {
          ...current,
          status: "creating",
          error: null,
        }
      })
      return
    }

    setState((current) => {
      switch (type) {
        case "TOGGLE_FILE": {
          if (current.status !== "selecting") {
            return current
          }

          const path = event.path
          const exists = current.selectedFiles.includes(path)

          return {
            ...current,
            selectedFiles: exists
              ? current.selectedFiles.filter((selected) => selected !== path)
              : [...current.selectedFiles, path],
          }
        }

        case "SELECT_ALL": {
          if (current.status !== "selecting") {
            return current
          }

          const allSelected =
            current.files.length > 0 &&
            current.selectedFiles.length === current.files.length

          return {
            ...current,
            selectedFiles: allSelected
              ? []
              : current.files.map((file) => file.path).filter(Boolean),
          }
        }

        case "NEXT": {
          if (current.status === "selecting") {
            return current.selectedFiles.length > 0
              ? { ...current, status: "metadata" }
              : current
          }

          if (current.status === "metadata") {
            return current.name.trim()
              ? { ...current, status: "review" }
              : current
          }

          return current
        }

        case "BACK": {
          if (current.status === "metadata") {
            return { ...current, status: "selecting" }
          }

          if (current.status === "review") {
            return { ...current, status: "metadata" }
          }

          return current
        }

        case "SET_NAME":
          return { ...current, name: event.name }

        case "SET_DESCRIPTION":
          return { ...current, description: event.description }

        case "SET_BUSINESS_CONTEXT":
          return { ...current, businessContext: event.context }

        case "SET_USE_CASE":
          return { ...current, useCase: event.useCase }

        default:
          return current
      }
    })
  }, [close, loadFiles])

  const open = useCallback(() => {
    send({ type: "OPEN" })
  }, [send])

  return {
    state,
    send,
    open,
    close,
  }
}
