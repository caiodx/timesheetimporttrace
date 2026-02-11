import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getEnvironment: () =>
    ipcRenderer.invoke("settings:getEnvironment") as Promise<
      { current: string; customHost: string } | null
    >,
  setEnvironment: (settings: { current: string; customHost: string }) =>
    ipcRenderer.invoke("settings:setEnvironment", settings)
});

export {};

