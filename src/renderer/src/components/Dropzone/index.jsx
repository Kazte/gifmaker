import { useState } from 'react'
import './index.css'

// eslint-disable-next-line react/prop-types
export const Dropzone = ({ filePath, onClickHandler, onDropHandler }) => {
  const [className, setClassName] = useState('normal')

  const dragOverHandler = (ev) => {
    ev.preventDefault()

    setClassName('dragover')
  }

  return (
    <div
      id="drop_zone"
      className={className + ' border' + ' drop-zone'}
      onDrop={onDropHandler}
      onDragOver={dragOverHandler}
      onMouseEnter={() => {
        setClassName('hover')
      }}
      onMouseLeave={() => {
        setClassName('normal')
      }}
      onClick={onClickHandler}
    >
      <p>Drag one file or click to open.</p>
      {filePath && <p>{filePath}</p>}
    </div>
  )
}
