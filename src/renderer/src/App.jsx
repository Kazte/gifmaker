import './App.css'
const { send, invoke, on, removeAllListeners } = window.electron.ipcRenderer
import { useEffect, useState } from 'react'
import { Dropzone, Modal, VideoPreview } from './components'
import { useDispatch } from 'react-redux'
import { pause } from './features/player/playerSlice'
import keyboardjs from 'keyboardjs'
import getVideoInfo from './ffmpeg'

// import logo from './assets/logo.png'

function App() {
  const [progress, setProgress] = useState(0)
  const [outputPath, setOutputPath] = useState('')
  const [filePath, setFilePath] = useState('')
  const [converting, setConverting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleFilePathChanged = (_filePath) => {
    setOutputPath('')
    setConverting(false)
    setProgress(0)
    setFilePath(_filePath)
  }

  const dispatch = useDispatch()

  useEffect(() => {
    keyboardjs.bind('mod + o', () => {
      clickHandler()
    })

    keyboardjs.bind('mod + c', () => {
      handleConvert()
    })

    on('file-path-change', (event, args) => {
      if (!args.canceled) {
        handleFilePathChanged(args.filePath)
      }
    })

    return () => {
      keyboardjs.unbind('mod + o')
      keyboardjs.unbind('mod + c')

      removeAllListeners('file-path-change')
    }
  }, [])

  useEffect(() => {
    if (filePath) {
      getVideoInfo(filePath)
    }
  }, [filePath])

  const dropHandler = (ev) => {
    ev.preventDefault()

    if (ev.dataTransfer.items) {
      if (ev.dataTransfer.items.length > 1) {
        send('show-error', {
          title: 'File length error',
          message: 'Please select only one file.'
        })
        return
      }

      // check if file is video
      if (ev.dataTransfer.items[0].kind === 'file') {
        const file = ev.dataTransfer.items[0].getAsFile()
        const fileExtension = file.name.split('.').pop()

        if (['mp4', 'mkv', 'avi', 'mov', 'wmv'].includes(fileExtension)) {
          handleFilePathChanged(file.path)
        } else {
          send('show-error', {
            title: 'File type error',
            message: 'Please select a video file.'
          })
        }
      }
    }
  }

  const clickHandler = async () => {
    send('open-file-dialog')
  }

  const handleConvert = async () => {
    setConverting(true)
    setShowModal(true)
    setOutputPath('')
    setProgress(0)

    dispatch(pause())

    const fileExtension = filePath.split('.').pop()
    const outputPath = filePath.replace(`.${fileExtension}`, '.gif')

    await send('convert-video', {
      inputPath: filePath,
      outputPath
    })

    on('progress', (event, progress) => {
      const { percent, done } = progress

      if (!isNaN(percent)) {
        setProgress(percent)
      } else {
        setProgress(0)
      }

      if (done) {
        setOutputPath(outputPath)
        setConverting(false)
      }
    })
  }

  const handleCancel = () => {
    setOutputPath('')
    setProgress(0)
    setConverting(false)

    send('cancel-convert')
  }

  const handleClear = () => {
    handleFilePathChanged('')
  }

  const openPath = (path) => {
    send('open-path', path)
  }

  const openFolder = (path) => {
    send('open-folder', path)
  }

  const getFileName = (path) => {
    const fileName = path.split('\\').pop()
    return fileName
  }

  return (
    <div className="app">
      {!filePath ? (
        <header>
          <img src="https://i.imgur.com/2k7CAKB.png" alt="logo" />
          <h1>GifMaker</h1>
        </header>
      ) : null}

      <main>
        <p>{getFileName(filePath)}</p>
        {filePath ? (
          <div className="video-preview-container">
            <VideoPreview path={filePath} />
          </div>
        ) : (
          <Dropzone
            handleFilePathChanged={handleFilePathChanged}
            onDropHandler={dropHandler}
            onClickHandler={clickHandler}
            filePath={filePath}
          />
        )}

        <div className="buttons">
          <button className="convert-button" disabled={filePath === ''} onClick={handleConvert}>
            Convert
          </button>

          <button className="convert-button" disabled={filePath === ''} onClick={handleClear}>
            Clear
          </button>
        </div>
      </main>

      {showModal && (
        <Modal isOpened={showModal}>
          <div className="progress">
            <h2>{converting ? 'Converting...' : 'Done!'}</h2>
            <div className="progress-bar">
              <progress value={progress} max="100"></progress>
              <p>{progress}%</p>
            </div>
          </div>

          <div className="output">
            <div className="output-buttons">
              <button
                className="open-button"
                disabled={outputPath === ''}
                onClick={() => {
                  openPath(outputPath)
                }}
              >
                Open
              </button>

              <button
                className="open-button"
                disabled={outputPath === ''}
                onClick={() => {
                  openFolder(outputPath)
                }}
              >
                Show in folder
              </button>

              <button
                className="open-button"
                disabled={!converting}
                onClick={() => {
                  handleCancel()
                }}
              >
                Cancel
              </button>

              <button
                className="close-button"
                disabled={converting}
                onClick={() => {
                  setShowModal(false)
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default App
