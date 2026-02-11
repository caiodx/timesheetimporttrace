import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb"
    },
    secondary: {
      main: "#64748b"
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff"
    }
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h4: {
      fontWeight: 600
    },
    body1: {
      fontSize: 14
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "default"
      },
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          backgroundColor: "rgba(248, 250, 252, 0.92)",
          backdropFilter: "blur(12px)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 500,
          paddingInline: 18,
          boxShadow: "none",
          transition: "background-color 120ms ease, border-color 120ms ease",
          "&:hover": {
            boxShadow: "none",
            backgroundColor: "rgba(15, 23, 42, 0.04)"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid rgba(148, 163, 184, 0.25)",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)"
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined"
      }
    }
  }
});

