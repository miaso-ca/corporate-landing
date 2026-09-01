import './VideoModal.css'

export default function VideoModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal__box video-modal__box--info" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={onClose} aria-label="Close">×</button>
        <h3>Video launching soon</h3>
        <p>Meet Valentina and the MIASO team — the video is on its way.</p>
      </div>
    </div>
  )
}
