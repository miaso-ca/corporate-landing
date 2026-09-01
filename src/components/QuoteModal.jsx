import QuickCaptureForm from './QuickCaptureForm.jsx'
import './QuoteModal.css'

export default function QuoteModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="video-modal" onClick={onClose}>
      <div className="video-modal__box quote-modal__box" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={onClose} aria-label="Close">×</button>
        <h3>Request a Corporate Quote</h3>
        <p>Share your details and we&rsquo;ll follow up within 1 business day.</p>
        <QuickCaptureForm source="how-it-works-modal" />
      </div>
    </div>
  )
}
