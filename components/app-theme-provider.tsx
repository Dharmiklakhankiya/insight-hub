"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { type PropsWithChildren, useMemo } from "react";

export default function AppThemeProvider({
  children,
}: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#005f73",
          },
          secondary: {
            main: "#ca6702",
          },
          background: {
            default: "#f8f3e9",
            paper: "#ffffff",
          },
          text: {
            primary: "#1f2937",
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "var(--font-manrope), var(--font-ibm-plex-sans), sans-serif",
          h1: {
            fontWeight: 800,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                border: "1px solid rgba(0,0,0,0.06)",
              },
            },
          },
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
