import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getUserInfo: () => ipcRenderer.invoke('getUserInfo'),
  setUserInfo: (info) => ipcRenderer.invoke('setUserInfo', info)
})
