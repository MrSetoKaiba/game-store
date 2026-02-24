function Modal({ isOpen, onClose, title, children, customStyle = {} }) {
    if (!isOpen) return null

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" style={customStyle} onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">{title}</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>
                <div className="modal__body">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
