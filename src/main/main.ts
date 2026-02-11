import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import { getEnvironmentSettings, saveEnvironmentSettings } from "./storage";

const isDev = process.env.NODE_ENV === "development";

function registerIpc() {
  ipcMain.handle("settings:getEnvironment", () => {
    return getEnvironmentSettings();
  });

  ipcMain.handle(
    "settings:setEnvironment",
    (_event, settings: { current: string; customHost: string }) => {
      saveEnvironmentSettings(settings);
    }
  );
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js")
    }
  });

  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "../renderer/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }
}

app.on("ready", () => {
  registerIpc();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

