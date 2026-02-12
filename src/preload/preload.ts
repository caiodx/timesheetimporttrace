import { contextBridge } from "electron";

// ElectronAPI removido - não há mais persistência de preferências
contextBridge.exposeInMainWorld("electronAPI", {});

export {};

