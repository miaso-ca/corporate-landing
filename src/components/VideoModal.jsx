import './VideoModal.css'
import valentinaIntro from '../assets/videos/valentina-intro.mp4'

export default function VideoModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal__box video-modal__box--video" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={onClose} aria-label="Close">×</button>
        <video src={valentinaIntro} controls autoPlay playsInline />
      </div>
    </div>
  )
}
