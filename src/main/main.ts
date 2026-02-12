import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";

const isDev = process.env.NODE_ENV === "development";

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
        // Em build, o __dirname aqui é "dist/main/main"
        // O index.html gerado pelo Vite fica em "dist/renderer/index.html"
        // Por isso precisamos subir dois níveis: "../../renderer/index.html"
        pathname: path.join(__dirname, "../../renderer/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }
}

app.on("ready", () => {
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

