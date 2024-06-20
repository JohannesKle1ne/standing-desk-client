import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getUserInfo: () => ipcRenderer.invoke('getUserInfo'),
  setUserInfo: (info) => ipcRenderer.invoke('setUserInfo', info),
  hideWindow: () => ipcRenderer.invoke('hideWindow'),
  quitApp: () => ipcRenderer.invoke('quitApp'),
  logOut: () => ipcRenderer.invoke('logOut')
})
