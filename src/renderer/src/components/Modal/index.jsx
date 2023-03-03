import { createPortal } from 'react-dom'

export const Modal = () => {
  return createPortal(
    <div className="modal">
      <h1>Modal</h1>
    </div>,
    document.getElementById('modal')
  )
}
