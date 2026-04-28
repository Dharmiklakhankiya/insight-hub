"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { type PropsWithChildren, useMemo } from "react";

export default function AppThemeProvider({ children }: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#002147",
            light: "#2d476f",
            dark: "#000a1e",
          },
          secondary: {
            main: "#4c616c",
          },
          background: {
            default: "#f8f9fa",
            paper: "#ffffff",
          },
          text: {
            primary: "#191c1d",
            secondary: "#44474e",
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: "var(--font-inter), sans-serif",
          h1: {
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          },
          h2: {
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },
          h3: {
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 700,
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
                border: "none",
                boxShadow: "0px 4px 20px rgba(25, 28, 29, 0.05)",
                backgroundColor: "#ffffff",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                boxShadow: "none",
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
