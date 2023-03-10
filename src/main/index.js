import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { autoUpdater } from 'electron-updater'
let mainWindow = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: false
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    autoUpdater.checkForUpdates()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

autoUpdater.on('update-available', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Update', 'Cancel'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been found. Downloading now...'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('show-error', (event, args) => {
  var { title, message } = args
  dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
    title: title,
    message: message,
    type: 'error'
  })
})

ipcMain.on('open-file-dialog', async (event) => {
  const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select video',
    properties: ['openFile'],
    filters: [
      {
        name: 'Video',
        extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm']
      }
    ]
  })

  const filePath = filePaths[0] === undefined ? '' : filePaths[0]
  console.log(filePath)
  event.reply('file-path-change', { filePath, canceled })
})

ipcMain.on('open-path', (event, args) => {
  console.log(args)
  shell.openPath(args)
})

ipcMain.on('open-folder', (event, args) => {
  shell.showItemInFolder(args)
})
