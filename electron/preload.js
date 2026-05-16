const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("commandOS", {
  openExternal: (url) => ipcRenderer.invoke("commandos:open-external", url),
  platform: process.platform,
});
