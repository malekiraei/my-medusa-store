import React from "react"
import "@mantine/core/styles.css"
import { MantineProvider, createTheme } from "../vendor"

const theme = createTheme({
  fontFamily: "inherit",
  headings: {
    fontFamily: "inherit",
  },
  primaryColor: "blue",
  defaultRadius: "lg",
  components: {
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        shadow: "xs",
      },
    },
  },
})

type PRProviderProps = {
  children: React.ReactNode
}

export function PRProvider({ children }: PRProviderProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  )
}