import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getId: () => ipcRenderer.invoke('getId')
})
