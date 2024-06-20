import { app, shell, BrowserWindow, Tray, Menu, screen, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { mouse, keyboard, Key } from '@nut-tree/nut-js'

const runAutoLauncher = () => {
  var AutoLaunch = require('auto-launch')

  var deskAutoLauncher = new AutoLaunch({
    name: 'StandingDeskApp'
  })

  deskAutoLauncher.enable()

  //minecraftAutoLauncher.disable();

  deskAutoLauncher
    .isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) {
        return
      }
      deskAutoLauncher.enable()
    })
    .catch(function (err) {
      // handle error
    })
}

runAutoLauncher()

const fs = require('fs').promises
const path = require('path')

const getUserInfoFilePath = () => {
  return path.join(app.getPath('userData'), 'user_info.json')
}

const setUserInfo = async (event, userInfo) => {
  const filePathToUserInfo = getUserInfoFilePath()
  const data = JSON.stringify(userInfo)
  try {
    await fs.writeFile(filePathToUserInfo, data, 'utf8')
    console.log('User info written to file')
  } catch (error) {
    console.error('User info could not be set:', error)
  }
}

const getUserInfo = async () => {
  const filePathToUserInfo = getUserInfoFilePath()
  try {
    const data = await fs.readFile(filePathToUserInfo, 'utf8')
    const obj = JSON.parse(data)
    return obj
  } catch (error) {
    console.error('User info could not be read:', error)
  }
}

const removeUserInfoFile = async () => {
  const filePathToUserInfo = getUserInfoFilePath()
  try {
    await fs.unlink(filePathToUserInfo)
    console.log('User info file removed')
  } catch (error) {
    console.error('User info file could not be removed:', error)
  }
}

let tray

// Function to get the current time in the desired format
function getCurrentTime() {
  const now = new Date()
  const formattedTime = now.toISOString().replace('T', ' ').split('.')[0]
  return formattedTime
}

// Function to add a new line with the current time to the file
function addNewLineToFile(filePath) {
  const currentTime = getCurrentTime()
  const newLine = `${currentTime} - Motion detected!\n`

  // Read the existing content from the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err)
      return
    }

    // Append the new line to the existing content
    const updatedContent = data + newLine

    // Write the updated content back to the file
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file:', err)
        return
      }

      console.log('New line added successfully!')
    })
  })
}

// Example usage
const filePath = path.join(__dirname, '../../resources/logs.txt')

let lastPosition
/* setInterval(async () => {
  const position = await mouse.getPosition()
  console.log(position)
  if (JSON.stringify(lastPosition) !== JSON.stringify(position)) {
    addNewLineToFile(filePath)
  }
  lastPosition = position
}, 30000) */

let mainWindow

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const windowWidth = 1000
  const windowHeight = 600

  // Calculate the position for the bottom right corner
  const x = width - windowWidth - 50 // Adjust the value based on your window width
  const y = height - windowHeight - 50 // Adjust the value based on your window height

  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('blur', (e) => {
    // Prevent the window from actually closing
    e.preventDefault()
    // mainWindow.hide()
  })

  mainWindow.on('close', (event) => {
    // Prevent the window from actually closing
    //event.preventDefault()
    //app.quit()
  })

  tray = new Tray(path.join(__dirname, '../../resources/icon16x16.png'))

  const contextMenu = Menu.buildFromTemplate([
    /*     { label: 'Show App', click: () => mainWindow.show() },
     */ { label: 'Quit', click: () => app.quit() }
  ])

  // Set the tray icon and context menu
  tray.setToolTip('Electron Tray Example')
  tray.setContextMenu(contextMenu)

  // Show/hide the main window when the tray icon is clicked
  tray.on('click', () => {
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })
  /* 
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  }) */

  mainWindow.webContents.openDevTools()

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('getUserInfo', getUserInfo)
  ipcMain.handle('setUserInfo', setUserInfo)
  ipcMain.handle('hideWindow', () => {
    mainWindow.hide()
  })
  ipcMain.handle('quitApp', () => {
    app.quit()
  })
  ipcMain.handle('logOut', async () => {
    await removeUserInfoFile()
    app.relaunch()
    app.exit()
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
