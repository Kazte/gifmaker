import { useLayoutEffect, useState } from 'react'
import { createWrapperAndAppendToBody } from '../../utils/utils'
import './index.css'

import { createPortal } from 'react-dom'

// eslint-disable-next-line react/prop-types
export const Modal = ({ children, isOpened }) => {
  const [wrapperElement, setWrapperElement] = useState(null)

  useLayoutEffect(() => {
    let element = document.getElementById('modal-root')
    if (!element) {
      element = createWrapperAndAppendToBody('modal-root')
    }

    setWrapperElement(element)
  }, [wrapperElement])

  if (!wrapperElement) {
    return null
  }

  return createPortal(
    isOpened ? (
      <div className="modal">
        <div className="modal-content">{children}</div>
      </div>
    ) : null,
    wrapperElement
  )
}
