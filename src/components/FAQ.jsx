import { useState } from 'react'
import './FAQ.css'

const FAQS = [
  {
    q: 'How much does corporate catering cost?',
    a: 'Coffee breaks start at $13.50 per guest, the Mobile Cart at $22 per guest plus setup, and grazing tables at $48 per guest. Your quote confirms the final price.',
  },
  {
    q: 'Is there a minimum order?',
    a: 'Boards have no minimum. Individual cups start at 10, grazing tables at 15 guests and full-service catering at 20 guests.',
  },
  {
    q: 'How far in advance should we book?',
    a: 'Boards and cups: 24 hours. Grazing tables: 72 hours. Mobile Cart and full-service catering: 5-7 days. Holiday dates are limited, so book early.',
  },
  {
    q: 'What is included - setup, staffing and cleanup?',
    a: 'Drop-off orders arrive ready to serve. Grazing tables and catering include delivery, styling and setup; staffing and cleanup can be added. The Mobile Cart includes a staffed two-hour service.',
  },
  {
    q: 'Do you deliver across Toronto and the GTA?',
    a: 'Yes. Delivery is priced by distance zone and shown in your quote, with morning delivery windows for office orders.',
  },
  {
    q: 'Can you accommodate dietary requirements?',
    a: 'Yes - vegetarian, Halal-friendly, Kosher-friendly and allergy-aware options are available. List every requirement in your request and we will confirm them in your quote.',
  },
  {
    q: 'Can you provide catering and bar service together?',
    a: 'Yes. Through our long-time partner North Spirit Distillery, we add bartenders, mixers and glassware to your booking - one quote, one point of contact.',
  },
  {
    q: 'Can we set up recurring office orders?',
    a: 'Yes. Weekly or monthly breakfasts, lunches and coffee breaks can run as a standing order with a fixed or rotating menu.',
  },
  {
    q: 'What types of corporate events do you cater?',
    a: 'Office lunches, meetings, training days, client receptions, conferences, expos, product launches, holiday parties and team celebrations - from small team orders to large receptions.',
  },
  {
    q: 'When should we book our holiday party?',
    a: 'As soon as you have a date. December Thursdays and Fridays book first. Send your date and guest count and we will confirm availability within 1 business day.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  // No reveal wrapper here on purpose - see CateringOptions.jsx for the
  // full explanation. This section (10 FAQ items) was tall enough that the
  // single whole-section IntersectionObserver often didn't clear its 0.15
  // threshold until well past the point a visitor would expect to see it,
  // leaving the whole FAQ invisible in the meantime.

  return (
    <section className="section" id="faq">
      <div className="faq__panel">
        <h2>Frequently Asked Questions</h2>
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
