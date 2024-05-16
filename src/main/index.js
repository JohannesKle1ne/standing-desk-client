import { app, shell, BrowserWindow, Tray, Menu, screen, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { mouse, keyboard, Key } from '@nut-tree/nut-js'

const fs = require('fs').promises
const path = require('path')

const filePathToUserInfo = path.join(__dirname, '../../resources/user_info.json')

const setUserInfo = async (event, userInfo) => {
  console.log(userInfo)
  const data = JSON.stringify(userInfo)
  console.log('write new id to file')
  try {
    await fs.writeFile(filePathToUserInfo, data, 'utf8')
  } catch (error) {
    console.log('id could not be set')
  }
}

const getUserInfo = async () => {
  try {
    const data = await fs.readFile(filePathToUserInfo, 'utf8')
    const obj = JSON.parse(data)
    return obj
  } catch (error) {
    console.log('id could not be read')
  }
}

/* 
;(async () => {
  await setMissingId()
  const id = await getId()
  console.log('Id: ' + id)
})() */

// Function to generate a random ID
function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
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

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const windowWidth = 1000
  const windowHeight = 600

  // Calculate the position for the bottom right corner
  const x = width - windowWidth - 50 // Adjust the value based on your window width
  const y = height - windowHeight - 50 // Adjust the value based on your window height

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    frame: true,
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    show: true,
    autoHideMenuBar: false,
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
    event.preventDefault()

    // Hide the window instead
    mainWindow.hide()
  })

  tray = new Tray(path.join(__dirname, '../../resources/icon.png'))

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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

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
