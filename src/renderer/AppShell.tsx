import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Stack,
  useScrollTrigger,
  Slide
} from "@mui/material";
import { EnvironmentSelector } from "./features/timesheet/EnvironmentSelector";
import { TimesheetPage } from "./features/timesheet/TimesheetPage";

const HideOnScroll: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

export const AppShell: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default"
      }}
    >
      <HideOnScroll>
        <AppBar position="sticky">
          <Toolbar
            sx={{
              maxWidth: 1200,
              width: "100%",
              mx: "auto",
              py: 1,
              gap: 2
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  Timesheet Import Trace
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Monitor de jobs de sincronização de timesheets
                </Typography>
              </Box>
            </Stack>

            <EnvironmentSelector />
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3
        }}
      >
        <TimesheetPage />
      </Container>
    </Box>
  );
};

