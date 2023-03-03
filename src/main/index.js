import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'

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
      sandbox: false
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

ipcMain.handle('open-file-dialog', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'Select video',
    properties: ['openFile'],
    filters: [
      {
        name: 'Video',
        extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv']
      }
    ]
  })

  return { filePaths, canceled }
})

ipcMain.on('open-path', (event, args) => {
  console.log(args)
  shell.openPath(args)
})

ipcMain.on('open-folder', (event, args) => {
  shell.showItemInFolder(args)
})

ipcMain.on('convert-video', async (event, args) => {
  const { inputPath, outputPath } = args
  const totalFrames = await getTotalFrames(inputPath)

  const ffmpeg = spawn('ffmpeg', ['-y', '-i', inputPath, outputPath])

  ffmpeg.stdout.on('data', (data) => {
    console.log('stdout', data.toString())
  })

  ffmpeg.stderr.on('data', (data) => {
    const split = data.toString().split('frame=')
    const frame = parseInt(split[split.length - 1])
    const progress = (frame / totalFrames) * 100

    event.reply('progress', {
      percent: progress,
      done: false
    })
  })

  ffmpeg.on('close', (code) => {
    console.log(`done with code ${code}`)
    event.reply('progress', {
      percent: 100,
      done: true
    })
  })
})

const getTotalFrames = (inputPath) => {
  return new Promise((resolve) => {
    const ffprobe = spawn('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-count_frames',
      '-show_entries',
      'stream=nb_read_frames',
      '-print_format',
      'csv',
      inputPath
    ])

    let totalFrames = 0

    ffprobe.stdout.on('data', (data) => {
      const split = data.toString().split('stream,')[1]
      totalFrames = parseInt(split)
      resolve(totalFrames)
    })

    // ffprobe.stderr.on('data', (data) => {})

    // ffprobe.on('close', (code) => {})
  })
}

// create modal window
ipcMain.on('open-modal', (event, args) => {
  let win = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    },
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    frame: false
  })
  win.on('close', function () {
    win = null
  })
  win.loadURL('https://www.google.com/')
  win.show()
})
