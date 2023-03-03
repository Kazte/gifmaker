import './App.css'
const { send, invoke, on } = window.electron.ipcRenderer
import { useState } from 'react'
import { Dropzone, Modal } from './components'
function App() {
  const [progress, setProgress] = useState(0)
  const [outputPath, setOutputPath] = useState('')
  const [filePath, setFilePath] = useState('')
  const [converting, setConverting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const handleFilePathChanged = (filePath) => {
    setOutputPath('')
    setConverting(false)
    setProgress(0)
    setFilePath(filePath)
  }

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
          setFilePath(file.path)
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
    invoke('open-file-dialog').then((res) => {
      if (res) {
        if (res.canceled) {
          return
        }
        handleFilePathChanged(res.filePaths[0])
      }
    })
  }

  const handleConvert = async () => {
    setConverting(true)
    setShowModal(true)
    setOutputPath('')
    setProgress(0)
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

  const openPath = (path) => {
    send('open-path', path)
  }

  const openFolder = (path) => {
    send('open-folder', path)
  }

  // const handleClick = async () => {
  //   if (window) {
  //     const res = await send('show-error', {
  //       title: 'Error',
  //       message: 'Please select only one file.'
  //     })
  //     console.log(res)
  //   }
  // }

  return (
    <div className="app">
      <header>
        <h1>Gifmaker</h1>
      </header>

      <main>
        <Dropzone
          handleFilePathChanged={handleFilePathChanged}
          onDropHandler={dropHandler}
          onClickHandler={clickHandler}
          filePath={filePath}
        />

        <div className="buttons">
          <button className="convert-button" disabled={filePath === ''} onClick={handleConvert}>
            Convert
          </button>

          <button
            className="convert-button"
            disabled={filePath === ''}
            onClick={() => {
              setFilePath('')
              setOutputPath('')
            }}
          >
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
                className="close-button"
                disabled={outputPath === ''}
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
