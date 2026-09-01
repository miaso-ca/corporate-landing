import { useState } from 'react'
import useReveal from '../hooks/useReveal.js'
import './FAQ.css'

const FAQS = [
  {
    q: 'What types of corporate events do you cater?',
    a: 'MIASO caters office lunches, business meetings, training days, client receptions, conferences, expos, product launches, open houses, galas and company celebrations.',
  },
  {
    q: 'Do you deliver throughout Toronto and the GTA?',
    a: 'Yes. Delivery and on-site service are available across Toronto and selected GTA locations. Availability and delivery fees depend on the venue, timing and order size.',
  },
  {
    q: 'Can you accommodate dietary requirements?',
    a: 'Dietary-friendly options are available depending on the selected menu. Please share all allergies and requirements during the inquiry process so the available accommodations can be confirmed in your quote.',
  },
  {
    q: 'How far in advance should we inquire?',
    a: 'We recommend submitting your request as early as possible. The required lead time depends on the guest count, catering format, menu and level of customization.',
  },
  {
    q: 'Are setup, staffing and cleanup included?',
    a: 'It depends on the selected package. Drop-off catering, grazing tables, Mobile Cart and full-service catering include different service levels. Your quote will clearly specify everything included.',
  },
  {
    q: 'Can you provide both catering and bar service?',
    a: 'Yes. MIASO can coordinate food with North Spirit Distillery bar service through a combined booking, subject to event requirements and availability.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const { ref, visible } = useReveal()

  return (
    <section className={`section reveal ${visible ? 'reveal--visible' : ''}`} id="faq" ref={ref}>
      <h2>Corporate Catering Questions</h2>
      <div className="content-card">
        <div className="faq__list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div className="faq__item" key={item.q}>
                <button
                  className="faq__question"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq__icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                <div className={`faq__answer-wrap ${isOpen ? 'faq__answer-wrap--open' : ''}`}>
                  <p className="faq__answer" aria-hidden={!isOpen}>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
