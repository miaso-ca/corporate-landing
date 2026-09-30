# MIASO Landing TZ v1.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the client-approved TZ v1.2 changes to events.miaso.ca — Holiday 2026 bar, card pricing/CTAs, form field changes, FAQ replacement, review cleanup, and technical fixes — exactly as scoped in the design spec.

**Architecture:** Small, additive changes to the existing React/Vite static site. No new runtime dependencies, no build-tool changes. One new shared lib (`preselect.js`) lets three independent entry points (Holiday bar, catering cards, and — already built — nothing else) hand a value to the full form without prop-drilling through the whole component tree, via a `sessionStorage` flag written before navigation and read-once on the form's mount.

**Tech Stack:** React 18 + Vite 6, plain CSS (no framework), `sharp` (temporary, `--no-save`) for one-off image conversion. No test runner exists in this repo — see Global Constraints.

**Design spec:** `docs/superpowers/specs/2026-09-30-landing-tz-v1.2-design.md` — read it first, every task below implements one of its numbered sections.

## Global Constraints

- No test framework is installed (`package.json` has only `react`/`react-dom` + `vite`/`@vitejs/plugin-react`) and none is being added — out of scope, not requested. Every task's "test" step is the build-and-browser-verify loop already established all session: `npm run build`, `preview_start` (launch config name `miaso-corporate-preview`), then check via `read_page`/`get_page_text`/`javascript_tool`/screenshot as appropriate to what changed. This replaces pytest-style steps throughout this plan.
- Phone number is already `required: true` in `QuickCaptureForm.jsx` — do not touch it, it already matches the approved spec.
- Marketing-consent checkbox is **unchecked by default** in both forms — this is a fixed requirement (CASL), not a style choice. Never flip this default.
- New fields append to the **end** of `apps-script/Code.gs`'s `COLUMNS` array only — never insert in the middle (shifts every existing row's real data one column over).
- `apps-script/Code.gs` is **not** auto-deployed by `git push` — it's manually pasted into the Google Apps Script editor. Every task touching it ends with an explicit reminder to the user.
- Every commit message in this plan ends with the same attribution line used all session:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
- Backup tag `backup-before-tz-v1.2` already exists at the commit before this plan started — safe to `git reset --hard backup-before-tz-v1.2` if anything needs a full rollback.

---

### Task 1: Analytics — campaign param + card-click event

**Files:**
- Modify: `src/lib/analytics.js`
- Modify: `src/lib/submitLead.js`

**Interfaces:**
- Produces: `trackLead(eventId, extra)` — `extra` is an optional object; when it has a `campaign` key, that value is passed as a GA4 event param on `generate_lead`. Existing callers (`trackLead(eventId)`, no second arg) keep working unchanged.
- Produces: `trackCardClick(format)` — fires GA4 `card_click` and Meta Pixel custom `CardClick`, both with param `format` (the catering format name, e.g. `"Mobile Cart"`).
- Consumes (Task 3, 4): both new pieces are called from Holiday bar / catering card code written in later tasks.

- [ ] **Step 1: Extend `trackLead` to accept an optional `campaign` param**

In `src/lib/analytics.js`, replace:

```js
export function trackLead(eventId) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {}, eventId ? { eventID: eventId } : undefined)
  }
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead')
}
```

with:

```js
export function trackLead(eventId, extra) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {}, eventId ? { eventID: eventId } : undefined)
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'generate_lead', extra?.campaign ? { campaign: extra.campaign } : undefined)
  }
}
```

- [ ] **Step 2: Add `trackCardClick`**

In `src/lib/analytics.js`, right after `trackSocialClick`, add:

```js
// format: the catering format name shown on the card, e.g. "Mobile Cart" —
// fired on click, before the smooth-scroll to the full form, so we can
// measure click-to-submit drop-off separately from the form itself.
export function trackCardClick(format) {
  if (typeof window.fbq === 'function') window.fbq('trackCustom', 'CardClick', { format })
  if (typeof window.gtag === 'function') window.gtag('event', 'card_click', { format })
}
```

- [ ] **Step 3: Pass the Holiday campaign through in `submitLead.js`**

In `src/lib/submitLead.js`, find:

```js
    trackLead(eventId)
    return data
```

Replace with:

```js
    trackLead(eventId, { campaign: getUtm().utm_campaign })
    return data
```

(`getUtm` is already imported at the top of this file.)

- [ ] **Step 4: Build and verify no errors**

```bash
npm run build
```

Expected: build succeeds with no new warnings. This step has no visible UI effect yet — `trackCardClick` isn't called from anywhere until Task 4, and `campaign` is `undefined` (harmless, the `?.` guard and `gtag`'s own handling of `undefined` params both no-op cleanly) until Task 3 writes a real `utm_campaign`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/analytics.js src/lib/submitLead.js
git commit -m "$(cat <<'EOF'
Add campaign param to lead tracking and a card-click event

Lays the analytics groundwork for the Holiday 2026 bar (campaign
attribution on generate_lead) and catering-card CTAs (card_click /
CardClick, to measure click-to-submit drop-off before deciding whether
the scroll-to-form pattern needs a heavier popup later).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Shared preselect lib + smooth scroll

**Files:**
- Create: `src/lib/preselect.js`
- Modify: `src/lib/utm.js`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Produces: `setPreselect({ eventType, format })` — writes whichever of the two keys are given to `sessionStorage`.
- Produces: `readAndClearPreselect()` — returns `{ eventType, format }` (missing keys are `undefined`) and immediately clears the stored value, so a later plain navigation to `#quote` doesn't re-apply a stale preselect.
- Produces: `setCampaign(campaign)` in `utm.js` — merges `{ utm_campaign: campaign }` into the same `sessionStorage` bucket `getUtm()` already reads, so the existing Sheet column + the Task 1 `trackLead` campaign param both pick it up with zero further wiring.
- Consumes (Task 3): Holiday bar calls `setPreselect({ eventType: 'Holiday Party' })` and `setCampaign('holiday-2026')`.
- Consumes (Task 4): catering cards call `setPreselect({ format: option.title })`.
- Consumes (Task 7): `FinalForm` calls `readAndClearPreselect()` once on mount.

- [ ] **Step 1: Write `preselect.js`**

```js
// Hands a value from a click (Holiday bar CTA, a catering card's button)
// to FinalForm without prop-drilling through the whole tree — the button
// writes before navigating, FinalForm reads once on mount and clears it
// immediately, so a later plain click on the Nav's "FAQ"/etc. links (which
// never touch this key) or a manual visit to #quote never re-applies a
// stale value from an earlier click.
const KEY = 'miaso_preselect'

export function setPreselect(fields) {
  try {
    const current = JSON.parse(sessionStorage.getItem(KEY) || '{}')
    sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...fields }))
  } catch {
    // Private browsing / storage disabled — preselect is a convenience,
    // not worth failing the click over.
  }
}

export function readAndClearPreselect() {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
```

- [ ] **Step 2: Add `setCampaign` to `utm.js`**

In `src/lib/utm.js`, right after `captureUtm`, add:

```js
// Same sessionStorage bucket getUtm() reads — lets an on-site interaction
// (Holiday bar CTA) tag a lead's campaign the same way a real ad-click URL
// would, with no separate plumbing on the Code.gs/Sheet side.
export function setCampaign(campaign) {
  try {
    const current = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, utm_campaign: campaign }))
  } catch {
    // Private browsing / storage disabled — best-effort, not worth failing over.
  }
}
```

- [ ] **Step 3: Add smooth scroll**

In `src/styles/tokens.css`, right after the `:root { ... }` block closes, add:

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: succeeds. No visible change yet (nothing calls the new lib functions until Tasks 3/4/7); smooth scroll is inert until something links to an anchor, which the existing Footer `#quote` link already does — spot-check that one click in preview scrolls smoothly instead of jumping.

- [ ] **Step 5: Commit**

```bash
git add src/lib/preselect.js src/lib/utm.js src/styles/tokens.css
git commit -m "$(cat <<'EOF'
Add preselect helper and smooth scroll for upcoming CTA routing

preselect.js hands a value from a click to FinalForm's initial state
without prop-drilling; setCampaign() reuses the existing UTM
sessionStorage bucket so Holiday-bar leads get tagged with zero new
backend plumbing. Smooth scroll makes the upcoming scroll-to-form CTAs
(Holiday bar, catering cards) read as "go here", not a jump-cut.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Holiday 2026 announcement bar

**Files:**
- Create: `src/components/HolidayBar.jsx`
- Create: `src/components/HolidayBar.css`
- Modify: `src/App.jsx`
- Modify: `src/components/Nav.css`

**Interfaces:**
- Consumes: `setPreselect`, `setCampaign` from Task 2.
- Produces: nothing new consumed elsewhere — this is a leaf feature.

- [ ] **Step 1: Write `HolidayBar.jsx`**

```jsx
import { useState } from 'react'
import { setPreselect } from '../lib/preselect.js'
import { setCampaign } from '../lib/utm.js'
import './HolidayBar.css'

// Hides for good after this date (year boundary — 2026 → 2027) and also
// permanently once the visitor dismisses it (both checked before first
// paint so a dismissed/expired bar never flashes in, then out).
const HIDE_AFTER = new Date('2027-01-15T00:00:00')
const DISMISS_KEY = 'miaso_holiday_bar_dismissed'

function isPastHideDate() {
  return new Date() >= HIDE_AFTER
}

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export default function HolidayBar() {
  const [dismissed, setDismissed] = useState(() => isPastHideDate() || wasDismissed())

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Private browsing / storage disabled — worst case it reappears
      // next visit, not worth failing the dismiss click over.
    }
  }

  function handleCheckDates() {
    setPreselect({ eventType: 'Holiday Party' })
    setCampaign('holiday-2026')
  }

  return (
    <div className="holiday-bar">
      <p className="holiday-bar__text">
        <span className="holiday-bar__desktop">
          HOLIDAY 2026&nbsp;&nbsp;|&nbsp;&nbsp;Now booking November &amp; December holiday parties
        </span>
        <span className="holiday-bar__mobile">Now booking holiday parties</span>
      </p>
      <a className="holiday-bar__cta" href="#quote" onClick={handleCheckDates}>
        <span className="holiday-bar__desktop">Check availability</span>
        <span className="holiday-bar__mobile">Check dates</span>
      </a>
      <button
        className="holiday-bar__close"
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
      >
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Write `HolidayBar.css`**

```css
.holiday-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 44px;
  background: var(--ink);
  color: #fff;
  position: relative;
}

.holiday-bar__text {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: center;
}

.holiday-bar__cta {
  flex: none;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
  background: #fff;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  white-space: nowrap;
}

.holiday-bar__close {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
  opacity: 0.75;
}

.holiday-bar__close:hover {
  opacity: 1;
}

.holiday-bar__mobile {
  display: none;
}

@media (max-width: 640px) {
  .holiday-bar {
    padding: 8px 40px 8px 12px;
    gap: 10px;
  }
  .holiday-bar__desktop {
    display: none;
  }
  .holiday-bar__mobile {
    display: inline;
  }
  .holiday-bar__text {
    font-size: 11px;
    text-align: left;
  }
}
```

- [ ] **Step 3: Wrap Holiday bar + Nav in a fixed TopBar, remove Nav's own fixed positioning**

In `src/components/Nav.css`, replace:

```css
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  /* Was a dark transparent gradient with white text, tuned for sitting on
     top of Hero's old full-bleed photo. The redesigned Hero has a plain
     cream background from the very top now, so the nav needs the same
     solid/light look from the first frame — not just after the old
     scroll-triggered "solid" state. */
  background: var(--bg);
  border-bottom: 1px solid transparent;
  transition: background-color 0.28s var(--ease-out), border-color 0.28s var(--ease-out),
    box-shadow 0.28s var(--ease-out);
}
```

with:

```css
.nav {
  /* Fixed positioning now lives on .topbar (App.jsx), which wraps this
     together with the optional Holiday bar above it — Nav itself just
     flows normally inside that fixed wrapper. */
  background: var(--bg);
  border-bottom: 1px solid transparent;
  transition: background-color 0.28s var(--ease-out), border-color 0.28s var(--ease-out),
    box-shadow 0.28s var(--ease-out);
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}
```

- [ ] **Step 4: Wire `App.jsx` — render the bar, measure real height into `--nav-height`**

Read `src/App.jsx` first (it's short, already in context from this session — 34 lines, imports Nav/Hero/etc and renders them in a fragment with a `quoteOpen` state). Replace its full contents with:

```jsx
import { useLayoutEffect, useRef, useState } from 'react'
import Nav from './components/Nav.jsx'
import HolidayBar from './components/HolidayBar.jsx'
import Hero from './components/Hero.jsx'
import StatsBar from './components/StatsBar.jsx'
import CateringOptions from './components/CateringOptions.jsx'
import WhyMiaso from './components/WhyMiaso.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import SocialProof from './components/SocialProof.jsx'
import FAQ from './components/FAQ.jsx'
import FinalForm from './components/FinalForm.jsx'
import Footer from './components/Footer.jsx'
import QuoteModal from './components/QuoteModal.jsx'
import StickyCta from './components/StickyCta.jsx'

export default function App() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const topbarRef = useRef(null)

  // The Holiday bar changes the topbar's real height (present vs
  // dismissed, one line vs two on narrow screens) — every other layout
  // value that depends on nav height (Hero's top padding, every
  // section[id]'s scroll-margin-top) already reads the --nav-height CSS
  // var from tokens.css, so updating that one var here keeps them all
  // correct with no further wiring. Falls back to tokens.css's static
  // 84px default before this effect's first run.
  useLayoutEffect(() => {
    const node = topbarRef.current
    if (!node) return
    const setHeight = () => {
      document.documentElement.style.setProperty('--nav-height', `${node.offsetHeight}px`)
    }
    setHeight()
    const observer = new ResizeObserver(setHeight)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="topbar" ref={topbarRef}>
        <HolidayBar />
        <Nav onRequestQuote={() => setQuoteOpen(true)} />
      </div>
      <Hero onRequestQuote={() => setQuoteOpen(true)} />
      <StatsBar />
      <CateringOptions />
      <WhyMiaso />
      <HowItWorks onRequestQuote={() => setQuoteOpen(true)} />
      <SocialProof />
      <FAQ />
      <FinalForm />
      <Footer />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <StickyCta onRequestQuote={() => setQuoteOpen(true)} />
    </>
  )
}
```

- [ ] **Step 5: Build and verify in preview**

```bash
npm run build
```

Then via the Browser tool: `preview_start` (`miaso-corporate-preview`), reload, screenshot the top of the page. Expected: dark Holiday bar above the nav, nav sitting directly under it (no gap, no overlap with Hero's headline). Click the bar's close (×) — bar disappears, Nav moves up to fill the space, Hero's spacing doesn't jump oddly. Reload the page — bar stays dismissed (localStorage persisted). Click "Check availability"/"Check dates" — page smooth-scrolls to the full form at the bottom (preselect value itself is only visibly confirmed once Task 7 lands; for now just confirm the scroll happens and no console error appears — check via `read_console_messages`).

Resize to a narrow mobile width (375px) and re-screenshot — confirm the `holiday-bar__mobile` text/button show instead of the desktop copy, and the bar doesn't wrap awkwardly.

- [ ] **Step 6: Commit**

```bash
git add src/components/HolidayBar.jsx src/components/HolidayBar.css src/App.jsx src/components/Nav.css
git commit -m "$(cat <<'EOF'
Add dismissible Holiday 2026 announcement bar above the nav

Auto-hides after 2027-01-15 and once the visitor dismisses it
(localStorage). Its CTA smooth-scrolls to the full form, preselects
Event type = Holiday Party, and tags the lead's campaign as
holiday-2026 for GA4 and the Sheet's utm_campaign column. --nav-height
is now measured at runtime (topbar ResizeObserver) instead of the old
static 84px, so Hero's top padding and every section's scroll-margin
stay correct whether the bar is showing or not.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Catering card pricing, minimum and CTA

**Files:**
- Modify: `src/components/CateringOptions.jsx`
- Modify: `src/components/CateringOptions.css`

**Interfaces:**
- Consumes: `setPreselect` (Task 2), `trackCardClick` (Task 1).
- Produces: nothing new consumed elsewhere.

- [ ] **Step 1: Add price/minimum data and a scroll handler to `CateringOptions.jsx`**

In `src/components/CateringOptions.jsx`, add these two imports at the top, right after the existing `useReveal` import:

```js
import { setPreselect } from '../lib/preselect.js'
import { trackCardClick } from '../lib/analytics.js'
```

In the `OPTIONS` array, add a `priceLine` and `minimum` key to each entry (`null` where the spec says not to show one). For `Office Lunches & Drop-Off Catering`, add right after `title:`:

```js
    priceLine: 'Coffee breaks from $13.50/guest',
    minimum: null,
```

For `Shareable Platters`, add right after `title:`:

```js
    priceLine: null,
    minimum: 'No minimum',
```

For `Individual Cups & Boats`, add right after `title:`:

```js
    priceLine: 'From $14.50 each, down to $12 at 200+',
    minimum: '10 cups',
```

For `Mobile Cart`, add right after `title:`:

```js
    priceLine: 'From $22/guest + setup · 2-hour staffed service',
    minimum: null,
```

For `Full-Service Catering`, add right after `title:`:

```js
    priceLine: 'From $60/guest',
    minimum: '20 guests',
```

- [ ] **Step 2: Render price/minimum/button in `CateringCard`**

Replace the whole `CateringCard` function with:

```jsx
function CateringCard({ option, delay }) {
  const { ref, visible } = useReveal({ delay })

  function handleQuoteClick() {
    trackCardClick(option.title)
    setPreselect({ format: option.title })
  }

  return (
    <div
      className={`catering-card ${option.wide ? 'catering-card--wide' : ''} reveal ${visible ? 'reveal--visible' : ''}`}
      ref={ref}
    >
      <div className="catering-card__photo">
        <img
          src={option.photo}
          alt={option.alt}
          loading="lazy"
          style={option.photoPosition ? { objectPosition: option.photoPosition } : undefined}
        />
      </div>
      <div className="catering-card__body">
        <h3 className="catering-card__title">{option.title}</h3>
        <p className="catering-card__desc">{option.description}</p>
        {(option.priceLine || option.minimum) && (
          <p className="catering-card__price">
            {option.priceLine}
            {option.priceLine && option.minimum && ' · '}
            {option.minimum}
          </p>
        )}
        <span className="pill pill--on-light catering-card__best-for">Best for: {option.bestFor}</span>
        <a className="btn catering-card__cta" href="#quote" onClick={handleQuoteClick}>
          Get a Quote
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Style the new elements**

In `src/components/CateringOptions.css`, replace:

```css
.catering-card__best-for {
  /* margin-top:auto only fills LEFTOVER row height (0 in the tallest card
     of the row) — the real minimum gap above the pill comes from
     .catering-card__desc's own margin-bottom, which never collapses
     against a flex sibling's auto margin. */
  margin: auto 24px 24px;
  align-self: flex-start;
}
```

with:

```css
.catering-card__price {
  font-size: 13px;
  font-weight: 600;
  color: var(--cta);
  margin: 0 24px 10px;
}

.catering-card__best-for {
  margin: 0 24px 16px;
  align-self: flex-start;
}

.catering-card__cta {
  /* Pins to the card's bottom edge regardless of how long the
     description/best-for text runs above it — same auto-margin trick
     .catering-card__best-for used to do alone. */
  margin: auto 24px 24px;
  text-align: center;
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Via the Browser tool: preview, screenshot the catering cards grid. Expected: every card shows its price/minimum line (where applicable) above the "Best for" pill, and a "Get a Quote" button pinned to the card's bottom edge, all cards in a row still equal height. Click one card's button — confirm smooth-scroll to the full form (format preselect itself verified end-to-end in Task 7). Check `read_console_messages` for errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/CateringOptions.jsx src/components/CateringOptions.css
git commit -m "$(cat <<'EOF'
Add price, minimum and a Get a Quote CTA to every catering card

Every card now scrolls to the existing full form and preselects its
format — no card routes to an external shop (confirmed with the client:
ad traffic to this landing stays on the landing). Click fires a
card_click/CardClick analytics event first, so drop-off from card click
to form submission is measurable.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Office Lunches photo — BLOCKED, needs client asset

**Files:**
- Modify: `src/components/CateringOptions.jsx` (swap one `import` line + one `alt` string once the photo exists)

This task cannot be completed yet — no raw (no-text-overlay) photo of lunch boxes, power bowls or grazing boats exists in this repo or in `~/Downloads`. The three recent files there (`кейтеринг 1.png`, `кейтеринг 2 варіант 1/2.png`) are finished ad creatives with baked-in headline/CTA text, not usable as a card photo.

- [ ] **Step 1 (once a clean photo is supplied):** save it to
  `src/assets/photos/catering-office-lunches.jpg` (or `.webp` directly —
  see Task 12's pattern), then in `src/components/CateringOptions.jsx`
  change the import:

  ```js
  import lunchesPhoto from '../assets/photos/catering-office-lunches.jpg'
  ```

  and update the `Office Lunches & Drop-Off Catering` option's `alt` text
  to describe the new photo (currently describes a cheese/charcuterie
  spread, which is exactly what this swap is meant to fix).

- [ ] **Step 2:** `npm run build`, preview, confirm the card shows the new
  photo at the right crop (`photoPosition` may need adjusting for the new
  image's composition — same pattern as the existing `photoPosition: '50%
  95%'` comment on this option).

- [ ] **Step 3:** commit with a message naming what the photo now shows.

---

### Task 6: Quick form — guests, format, consent checkbox

**Files:**
- Modify: `src/components/QuickCaptureForm.jsx`
- Modify: `src/components/QuickCaptureForm.css`

**Interfaces:**
- Produces: nothing new consumed elsewhere — `submitLead({ ...values, source })` already forwards whatever keys exist on `values`, so adding `guests`/`format`/`consent` to this form's local state is sufficient for them to reach the Sheet (once Task 11 adds the matching `COLUMNS` entries for `consent` — `guests`/`format` already exist in `COLUMNS`).

- [ ] **Step 1: Add the two new fields and consent state**

In `src/components/QuickCaptureForm.jsx`, replace the `FIELDS` array:

```js
const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
  {
    name: 'eventDate',
    label: 'Event Date',
    type: 'date',
    required: false,
    hint: "Optional — leave blank if you're not sure yet",
  },
]
```

with:

```js
const CATERING_FORMATS = [
  'Office Lunches & Drop-Off Catering',
  'Shareable Platters',
  'Individual Cups & Boats',
  'Mobile Cart',
  'Full-Service Catering',
  'Catering + Bar Service',
  'Not sure yet',
]

const FIELDS = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
  {
    name: 'eventDate',
    label: 'Event Date',
    type: 'date',
    required: false,
    hint: "Optional — leave blank if you're not sure yet",
  },
  { name: 'guests', label: 'Number of Guests', type: 'number', required: true, min: 1, max: 2000 },
  { name: 'format', label: 'Catering Format', type: 'select', required: true, options: CATERING_FORMATS },
]
```

Update the initial `values` state:

```js
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guests: '',
    format: '',
    website: '',
  })
  const [consent, setConsent] = useState(false)
```

Update `validate()` to handle the `number` and `select` field types (mirrors the pattern already used in `FinalForm.jsx`):

```js
  function validate() {
    const next = {}
    FIELDS.forEach(({ name, label, required, type, min, max }) => {
      const value = values[name].trim()
      if (required && !value) {
        next[name] = `${label} is required`
      } else if (name === 'email' && value && !EMAIL_RE.test(value)) {
        next[name] = 'Enter a valid email address'
      } else if (name === 'phone' && value && !isValidPhone(value)) {
        next[name] = 'Enter a valid phone number'
      } else if (type === 'number' && value) {
        const num = Number(value)
        if (!Number.isInteger(num) || num < min || num > max) {
          next[name] = `Enter a number between ${min} and ${max}`
        }
      } else if (type === 'date' && value && value < TODAY) {
        next[name] = "Pick today's date or later"
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }
```

Include `consent` in the submitted payload — in `handleSubmit`, change:

```js
      await submitLead({ ...values, source })
```

to:

```js
      await submitLead({ ...values, consent, source })
```

- [ ] **Step 2: Render `select`/`number` inputs and the checkbox**

Replace the `FIELDS.map(...)` block:

```jsx
      {FIELDS.map(({ name, label, type, hint }) => (
        <div className="quick-form__field" key={name}>
          <label htmlFor={`${source}-${name}`}>{label}</label>
          <input
            id={`${source}-${name}`}
            type={type}
            value={values[name]}
            onChange={(e) => handleChange(name, e.target.value)}
            min={type === 'date' ? TODAY : undefined}
          />
          {hint && !errors[name] && <span className="quick-form__hint">{hint}</span>}
          {errors[name] && <span className="quick-form__error">{errors[name]}</span>}
        </div>
      ))}
```

with:

```jsx
      {FIELDS.map(({ name, label, type, hint, options, min, max }) => (
        <div className="quick-form__field" key={name}>
          <label htmlFor={`${source}-${name}`}>{label}</label>
          {type === 'select' ? (
            <select
              id={`${source}-${name}`}
              value={values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              <option value="" disabled>
                Select an option
              </option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${source}-${name}`}
              type={type}
              value={values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
              min={type === 'date' ? TODAY : type === 'number' ? min : undefined}
              max={type === 'number' ? max : undefined}
              step={type === 'number' ? 1 : undefined}
            />
          )}
          {hint && !errors[name] && <span className="quick-form__hint">{hint}</span>}
          {errors[name] && <span className="quick-form__error">{errors[name]}</span>}
        </div>
      ))}
      <label className="quick-form__consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        I agree to receive news and special offers from MIASO by email, SMS and WhatsApp. I can
        unsubscribe at any time.
      </label>
```

(Place this right before the existing `{submitError && ...}` line.)

- [ ] **Step 3: Style the checkbox and widen the grid for 6 fields**

In `src/components/QuickCaptureForm.css`, replace:

```css
.quick-form {
  display: grid;
  /* 4 equal field columns + a 5th "auto" column for the button, all in the
     SAME row — putting the button on its own row below left a big empty
     strip under Name/Email/Phone with only the button floating on the
     right. align-items:end lines every input up on one baseline. */
  grid-template-columns: repeat(4, minmax(140px, 1fr)) auto;
  align-items: end;
  gap: 16px;
  margin-top: 20px;
  padding: 24px 24px 34px;
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid #f0e2d0;
}
```

with:

```css
.quick-form {
  display: grid;
  /* 6 field columns now (added guests + format) — the trailing CTA button
     no longer shares the last field's row at this width, it drops to its
     own full-width row instead (see .quick-form .btn below). */
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  align-items: end;
  gap: 16px;
  margin-top: 20px;
  padding: 24px 24px 34px;
  background: var(--card);
  border-radius: var(--radius);
  border: 1px solid #f0e2d0;
}

.quick-form__field select {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--ink);
  padding: 10px 12px;
  border: 1px solid #e0d0ba;
  border-radius: var(--radius-sm);
  background: var(--bg);
}

.quick-form .btn {
  grid-column: 1 / -1;
}

.quick-form__consent {
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #4a3c2c;
}

.quick-form__consent input {
  margin-top: 3px;
  flex: none;
}
```

Update the two responsive overrides further down — replace:

```css
@media (max-width: 720px) {
  .quick-form {
    grid-template-columns: 1fr 1fr;
  }
  .quick-form__hint {
    position: static;
    margin-top: 0;
    white-space: normal;
  }
  .quick-form .btn {
    grid-column: 1 / -1;
    justify-self: end;
  }
```

with:

```css
@media (max-width: 720px) {
  .quick-form {
    grid-template-columns: 1fr 1fr;
  }
  .quick-form__hint {
    position: static;
    margin-top: 0;
    white-space: normal;
  }
  .quick-form .btn {
    justify-self: end;
  }
```

(Only the duplicate `grid-column: 1 / -1` is removed — it now lives once, on the base `.quick-form .btn` rule above, instead of being re-declared in this media query.)

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Preview, screenshot the quick form (used in `CateringOptions`'s "Let's Get You a Quote" block and `QuoteModal`). Expected: Guests and Format fields present, both required (submit empty → inline errors), consent checkbox visible and **unchecked** by default, submitting without checking it still succeeds. Check at a mobile width too — form should stack to 1-2 columns per the existing responsive rules, checkbox readable.

- [ ] **Step 5: Commit**

```bash
git add src/components/QuickCaptureForm.jsx src/components/QuickCaptureForm.css
git commit -m "$(cat <<'EOF'
Add guests/format fields and marketing consent to the quick form

Guests and Catering format are required, matching the full form's
existing fields of the same name (both already columns in Code.gs's
Sheet). Consent checkbox is unchecked by default — required for valid
CASL marketing consent, not a UX choice.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Full form — event types, postal code, required marks, consent, preselect

**Files:**
- Modify: `src/components/FinalForm.jsx`
- Modify: `src/components/FinalForm.css`

**Interfaces:**
- Consumes: `readAndClearPreselect` (Task 2).

- [ ] **Step 1: Extend `EVENT_TYPES`, add `Postal code` field, add consent state**

In `src/components/FinalForm.jsx`, replace:

```js
const EVENT_TYPES = [
  'Office Lunch or Meeting',
  'Team Celebration',
  'Client Event',
  'Company Milestone',
  'Not sure yet',
]
```

with:

```js
const EVENT_TYPES = [
  'Office Lunch or Meeting',
  'Team Celebration',
  'Client Event',
  'Company Milestone',
  'Holiday Party',
  'Conference / Expo',
  'Product Launch',
  'Gala',
  'Not sure yet',
]
```

In the `FIELDS` array, add a `postalCode` entry right after `venue`:

```js
  { name: 'venue', label: 'Venue or Location', type: 'text', required: false },
  { name: 'postalCode', label: 'Postal Code', type: 'text', required: false },
```

Add the `readAndClearPreselect` import at the top, right after the `useReveal` import:

```js
import readAndClearPreselect from '../lib/preselect.js'
```

Wait — `preselect.js` exports `readAndClearPreselect` as a **named** export (see Task 2), not default. Use:

```js
import { readAndClearPreselect } from '../lib/preselect.js'
```

Replace the `values`/`consent` state setup:

```js
  const [values, setValues] = useState(INITIAL_VALUES)
```

with:

```js
  const [values, setValues] = useState(() => ({ ...INITIAL_VALUES, ...readAndClearPreselect() }))
  const [consent, setConsent] = useState(false)
```

(`readAndClearPreselect()` only ever returns `eventType`/`format` keys, both of which already exist in `INITIAL_VALUES` since `FIELDS` defines them — spreading it over the defaults after `INITIAL_VALUES` overwrites just those two when present, leaves every other field at `''`.)

Include `consent` in submission — in `handleSubmit`, change:

```js
      await submitLead({ ...values, source: 'full-form' })
```

to:

```js
      await submitLead({ ...values, consent, source: 'full-form' })
```

- [ ] **Step 2: Mark required fields visually**

Replace the label render inside the `FIELDS.map(...)` block:

```jsx
                    <label htmlFor={`final-${name}`}>{label}</label>
```

with:

```jsx
                    <label htmlFor={`final-${name}`}>
                      {label}
                      {FIELDS.find((f) => f.name === name).required && (
                        <span className="final-form__required" aria-hidden="true"> *</span>
                      )}
                    </label>
```

Add the consent checkbox right before the existing `{submitError && ...}` line:

```jsx
            <label className="final-form__consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              I agree to receive news and special offers from MIASO by email, SMS and WhatsApp. I
              can unsubscribe at any time.
            </label>
```

- [ ] **Step 3: Style the asterisk and checkbox**

In `src/components/FinalForm.css`, right after the `.final-form__field label { ... }` rule, add:

```css
.final-form__required {
  color: var(--cta);
}

.final-form__consent {
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #4a3c2c;
  margin-top: 4px;
}

.final-form__consent input {
  margin-top: 3px;
  flex: none;
}
```

Note `.final-form__consent` sits inside `.final-form__form`, not `.final-form__grid` (same level as the submit button) — so `grid-column: 1 / -1` above has no effect there and can be dropped; leave it out:

```css
.final-form__consent {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #4a3c2c;
  margin-top: 4px;
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Preview. On `/#quote`, confirm: 9 Event Type options now (new 4 inserted before "Not sure yet"), Postal Code field present between Venue and Budget, required field labels show a red `*`, consent checkbox unchecked by default. Then, in the same preview tab, click a catering card's "Get a Quote" button (Task 4) and confirm the page scrolls to this form with **Preferred Catering Format already showing the clicked card's name** instead of "Select an option". Reload the page and scroll to `#quote` directly (no card click first) — format field should be back to empty/placeholder, confirming the preselect clears itself and doesn't leak into unrelated visits. Repeat with the Holiday bar's "Check availability" button — confirm Event Type shows "Holiday Party".

- [ ] **Step 5: Commit**

```bash
git add src/components/FinalForm.jsx src/components/FinalForm.css
git commit -m "$(cat <<'EOF'
Add new event types, postal code, required marks and consent to the full form

Event Type gains Holiday Party / Conference / Expo / Product Launch /
Gala. New Postal Code field for delivery-zone lookup. Required fields
now show a red asterisk. Reads the Task 2 preselect helper once on
mount so the Holiday bar and catering-card CTAs land here with the
right field already filled in.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: FAQ replacement

**Files:**
- Modify: `src/components/FAQ.jsx`

- [ ] **Step 1: Replace the `FAQS` array**

Replace the entire `FAQS` array in `src/components/FAQ.jsx` with:

```js
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
    q: 'What is included - setup, staffing and cleanup?',
    a: 'Drop-off orders arrive ready to serve. Grazing tables and catering include delivery, styling and setup; staffing and cleanup can be added. The Mobile Cart includes a staffed two-hour service.',
  },
  {
    q: 'Do you deliver across Toronto and the GTA?',
    a: 'Yes. Delivery is priced by distance zone and shown in your quote, with morning delivery windows for office orders.',
  },
  {
    q: 'Can you accommodate dietary requirements?',
    a: 'Yes - vegetarian, Halal-friendly, Kosher-friendly and allergy-aware options are available. List every requirement in your request and we will confirm them in your quote.',
  },
  {
    q: 'Can you provide catering and bar service together?',
    a: 'Yes. Through our long-time partner North Spirit Distillery, we add bartenders, mixers and glassware to your booking - one quote, one point of contact.',
  },
  {
    q: 'Can we set up recurring office orders?',
    a: 'Yes. Weekly or monthly breakfasts, lunches and coffee breaks can run as a standing order with a fixed or rotating menu.',
  },
  {
    q: 'What types of corporate events do you cater?',
    a: 'Office lunches, meetings, training days, client receptions, conferences, expos, product launches, holiday parties and team celebrations - from small team orders to large receptions.',
  },
  {
    q: 'When should we book our holiday party?',
    a: 'As soon as you have a date. December Thursdays and Fridays book first. Send your date and guest count and we will confirm availability within 1 business day.',
  },
]
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Preview, scroll to `#faq`, confirm all 10 new questions show in this exact order and the accordion open/close still works (click a question, confirm `aria-expanded` toggles via `read_page`).

- [ ] **Step 3: Commit**

```bash
git add src/components/FAQ.jsx
git commit -m "$(cat <<'EOF'
Replace generic FAQ copy with client-specified, concrete answers

10 questions in the order given: cost, minimum order, lead time,
what's included, delivery, dietary, bar service, recurring orders,
event types, holiday booking.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Remove unverified Lauren Mitchell review

**Files:**
- Modify: `src/components/SocialProof.jsx`

- [ ] **Step 1: Remove the entry**

In `src/components/SocialProof.jsx`, delete this object from the `REVIEWS` array:

```js
  {
    name: 'Lauren Mitchell',
    text: 'MIASO catered a team appreciation event at our Toronto office, and everything was excellent. The menu offered plenty of variety, the food arrived fresh and on time, and the setup looked polished. Our entire team had wonderful things to say.',
  },
```

`REVIEWS_PER_PAGE = 3` stays as-is — 8 reviews still paginates cleanly (3/3/2), no further change needed.

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Preview, scroll to the reviews section, page through all slides, confirm Lauren Mitchell no longer appears and the pagination dots/arrows still work with 8 reviews.

- [ ] **Step 3: Commit**

```bash
git add src/components/SocialProof.jsx
git commit -m "$(cat <<'EOF'
Remove unverified Lauren Mitchell review before ad launch

Checked 9 of 12 real Google reviews for MIASO (anonymous Maps access
caps out there) — Lauren Mitchell isn't among them. Per the client's
own TZ instruction, an unconfirmed review is removed rather than
replaced or left in place; can be restored with a clickable profile
link if the client verifies it later via their Google Business Profile
(which shows all 12).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Metadata — canonical URL and absolute image URLs

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add canonical, fix image URLs**

In `index.html`, right after the `<meta name="description" ...>` line, add:

```html
    <link rel="canonical" href="https://events.miaso.ca/" />
```

Replace both occurrences of `content="/og-image.jpg"` — one under `<meta property="og:image" ...>`, one under `<meta name="twitter:image" ...>` — with:

```html
    <meta property="og:image" content="https://events.miaso.ca/og-image.jpg" />
```

and

```html
    <meta name="twitter:image" content="https://events.miaso.ca/og-image.jpg" />
```

(edit each tag's `content` attribute in place — there are two separate lines, `og:image` and `twitter:image`, don't merge them).

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

```bash
grep -c 'rel="canonical"' dist/index.html
grep -o 'content="https://events.miaso.ca/og-image.jpg"' dist/index.html
```

Expected: canonical count is `1`; the absolute og-image URL appears twice (og:image + twitter:image).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Add canonical URL and make og:image/twitter:image absolute

Relative /og-image.jpg resolves fine in-browser but breaks when a
crawler (Facebook/LinkedIn link preview, etc.) fetches it without page
context — needs the full URL.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Backend — postalCode and consent Sheet columns

**Files:**
- Modify: `apps-script/Code.gs`

**Interfaces:**
- Consumes: field names `postalCode` (Task 7) and `consent` (Task 6, 7) must match these `COLUMNS` entries exactly.

- [ ] **Step 1: Append the two new columns**

In `apps-script/Code.gs`, replace:

```js
var COLUMNS = [
  'timestamp', 'source', 'name', 'email', 'phone', 'eventDate',
  'company', 'guests', 'venue', 'budget', 'format', 'dietary', 'details',
  'eventType', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
];
```

with:

```js
var COLUMNS = [
  'timestamp', 'source', 'name', 'email', 'phone', 'eventDate',
  'company', 'guests', 'venue', 'budget', 'format', 'dietary', 'details',
  'eventType', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'postalCode', 'consent',
];
```

- [ ] **Step 2: Add labels so they show in email/Telegram notifications**

Replace:

```js
  var labels = {
    source: 'Source', name: 'Name', email: 'Email', phone: 'Phone',
    eventType: 'Event type', eventDate: 'Event date', company: 'Company', guests: 'Guests',
    venue: 'Venue', budget: 'Budget', format: 'Format',
    dietary: 'Dietary', details: 'Details',
    utm_source: 'UTM source', utm_medium: 'UTM medium', utm_campaign: 'UTM campaign',
    utm_term: 'UTM term', utm_content: 'UTM content',
  };
```

with:

```js
  var labels = {
    source: 'Source', name: 'Name', email: 'Email', phone: 'Phone',
    eventType: 'Event type', eventDate: 'Event date', company: 'Company', guests: 'Guests',
    venue: 'Venue', budget: 'Budget', format: 'Format',
    dietary: 'Dietary', details: 'Details',
    utm_source: 'UTM source', utm_medium: 'UTM medium', utm_campaign: 'UTM campaign',
    utm_term: 'UTM term', utm_content: 'UTM content',
    postalCode: 'Postal code', consent: 'Marketing consent',
  };
```

- [ ] **Step 3: Verify (no local runner for Apps Script — reasoning check instead)**

Re-read `getSheet()`'s "self-healing header" comment in the same file — confirm the new columns land at the END (they do, appended after `utm_content`), so existing rows in the live Sheet won't shift. Confirm `leadSummaryLines` only lists a field when `payload[key]` is truthy, so leads from forms that predate this change (or the short form's submissions that don't set `postalCode`) won't show an empty "Postal code:" line.

- [ ] **Step 4: Commit**

```bash
git add apps-script/Code.gs
git commit -m "$(cat <<'EOF'
Add postalCode and consent columns to the lead Sheet

Appended at the end, per this file's own column-order rule, so
existing rows in the live Sheet aren't shifted.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Manual deploy reminder (cannot be done from this repo)**

**Tell the user:** this file is not auto-deployed by `git push` — open the
Google Sheet's Extensions → Apps Script editor, paste this file's new
content over the existing `Code.gs`, then Deploy → Manage deployments →
edit the existing Web App deployment → Deploy (keeping the same `/exec`
URL `submitLead.js` already points to). Without this manual step, the two
new fields are sent by the site but silently dropped by the backend.

---

### Task 12: Compress and convert heavy catering-card photos to WebP

**Files:**
- Modify: `src/components/CateringOptions.jsx` (4 import lines)
- Create: `src/assets/photos/catering-platter-tray.webp`, `catering-cart-wide.webp`, `catering-fullservice-tablewide.webp`, `catering-cups-lineup.webp`
- Delete: the 4 corresponding `.jpg` source files, once their imports are swapped

Target: Chrome, Safari and mobile Safari (this project's whole supported
matrix, already in the acceptance checklist) all support WebP natively —
no `<picture>`/fallback needed, a direct format swap is enough.

- [ ] **Step 1: Install a one-off image tool (not saved to package.json)**

```bash
npm install --no-save sharp
```

- [ ] **Step 2: Write and run a one-off conversion script**

```bash
cat > /tmp/optimize-miaso-photos.mjs <<'EOF'
import sharp from 'sharp'

const files = [
  'catering-platter-tray',
  'catering-cart-wide',
  'catering-fullservice-tablewide',
  'catering-cups-lineup',
]

for (const name of files) {
  const src = `src/assets/photos/${name}.jpg`
  const out = `src/assets/photos/${name}.webp`
  await sharp(src)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out)
  console.log(name, 'done')
}
EOF
node /tmp/optimize-miaso-photos.mjs
```

- [ ] **Step 3: Verify the new files and check sizes**

```bash
ls -la src/assets/photos/*.webp
du -h src/assets/photos/catering-platter-tray.webp src/assets/photos/catering-cart-wide.webp src/assets/photos/catering-fullservice-tablewide.webp src/assets/photos/catering-cups-lineup.webp
```

Expected: all 4 well under the old JPG sizes (888K/464K/240K/160K) — typically 60-140KB each at quality 78. If any is still over ~200KB, lower that one file's `quality` a bit in the script and rerun just that file.

- [ ] **Step 4: Swap the imports in `CateringOptions.jsx`**

Replace:

```js
import lunchesPhoto from '../assets/photos/catering-lunches-venue.jpg'
import platterSpreadPhoto from '../assets/photos/catering-platter-tray.jpg'
import fullserviceTableWidePhoto from '../assets/photos/catering-fullservice-tablewide.jpg'
import cupsLineupPhoto from '../assets/photos/catering-cups-lineup.jpg'
import cartWidePhoto from '../assets/photos/catering-cart-wide.jpg'
```

with:

```js
import lunchesPhoto from '../assets/photos/catering-lunches-venue.jpg'
import platterSpreadPhoto from '../assets/photos/catering-platter-tray.webp'
import fullserviceTableWidePhoto from '../assets/photos/catering-fullservice-tablewide.webp'
import cupsLineupPhoto from '../assets/photos/catering-cups-lineup.webp'
import cartWidePhoto from '../assets/photos/catering-cart-wide.webp'
```

(`catering-lunches-venue.jpg` stays untouched here — Task 5 replaces that
whole photo separately, no point compressing an image about to be deleted.)

- [ ] **Step 5: Delete the now-unused JPG sources**

```bash
rm src/assets/photos/catering-platter-tray.jpg src/assets/photos/catering-cart-wide.jpg src/assets/photos/catering-fullservice-tablewide.jpg src/assets/photos/catering-cups-lineup.jpg
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Check the build's asset size listing for these 4 files — confirm each is
now the small WebP size, not the old JPG size. Preview and screenshot the
catering cards grid — confirm all photos still load and look visually
equivalent (WebP at quality 78 should be indistinguishable from the
original JPGs at normal viewing size).

- [ ] **Step 7: Commit**

```bash
git add src/components/CateringOptions.jsx src/assets/photos/*.webp
git add -u src/assets/photos
git commit -m "$(cat <<'EOF'
Compress and convert the 4 heaviest catering photos to WebP

888K/464K/240K/160K JPGs -> WebP at quality 78, resized to a 1600px
max width (well above any real display size on this grid). All three
browsers in this project's support matrix (Chrome, Safari, mobile
Safari) handle WebP natively, so no <picture>/fallback markup needed.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage** — every numbered section of the design spec maps to a task:
- 01 (trust line, StatsBar) — explicitly dropped by the client, no task (correctly absent).
- 02 (Holiday bar) — Task 3 (+ Task 1/2 for its dependencies).
- 03 (card pricing/CTA) — Task 4 (+ Task 5 for the one blocked photo swap).
- 04 (both forms) — Task 6, Task 7.
- 05 (FAQ) — Task 8.
- 06 (Lauren Mitchell) — Task 9.
- 07 (canonical/og-image/compression) — Task 10, Task 12.
- 08 (analytics) — Task 1 (campaign param, card_click); GA4/Meta Lead firing-once-on-success already verified as correct in the spec, no code change needed there.
- Acceptance checklist's Hotjar/Contentsquare item and Chrome/Safari/mobile-Safari checks — manual verification during/after Task 12, not a code task (nothing in this plan touches the Contentsquare script tag).

**Placeholder scan** — no TBD/TODO, every step has real code or an explicit, named reason it's blocked (Task 5).

**Type/interface consistency** — checked: `preselect.js`'s `setPreselect`/`readAndClearPreselect` names and shapes match between Task 2 (producer) and Tasks 3/4 (write side) and Task 7 (read side). `trackCardClick(format)` and `trackLead(eventId, extra)` signatures match between Task 1 (producer) and Tasks 3/4/submitLead.js (consumers). `COLUMNS`/form field names (`postalCode`, `consent`, `guests`, `format`) match exactly between Task 6/7 (frontend) and Task 11 (backend).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-30-landing-tz-v1.2.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
