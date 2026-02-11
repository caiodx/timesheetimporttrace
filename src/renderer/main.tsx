import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { store } from "./store";
import { theme } from "./theme";
import { AppShell } from "./AppShell";

const Root: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Provider store={store}>
      <AppShell />
    </Provider>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Root />);

