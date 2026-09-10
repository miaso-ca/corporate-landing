# MIASO General Catering Landing (catering.miaso.ca) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a second MIASO landing page at `catering.miaso.ca`, forked from the `miaso-corporate-landing` codebase, targeting weddings/showers/brunches/home events with light-touch corporate mention, sharing the same lead-capture backend (Sheet/Telegram/email) as the corporate site via a new `site` routing field.

**Architecture:** Full git fork of `miaso-corporate-landing` (same React+Vite structure, same components, same CSS) into a new repo `miaso-ca/general-catering-landing`. Only data/copy files change — no component logic is rewritten. `apps-script/Code.gs` (the ALREADY-DEPLOYED shared Apps Script) gets extended to route by a new `site` payload field, so both sites' leads land in one Google Sheet (different tabs) and one Telegram group (different topics) without a second Apps Script deployment.

**Tech Stack:** React + Vite (unchanged from corporate), GitHub Actions → GitHub Pages, same Meta Pixel ID (`1650470559273087`) and GA4 property (`G-SS6HTCGBYL`) as corporate — no new tracking setup.

## Global Constraints

- No component (`.jsx`) gets restructured — only the data/copy passed into existing components changes. If a component's existing props/structure can't express something the spec needs, stop and flag it rather than improvising a structural change.
- Never show per-size exact prices (e.g. "$85 for XXS") on the public page — only the four "From $X" starting prices on the format cards, per spec constraint.
- `events.miaso.ca` (corporate repo) is not touched by any task in this plan.
- North Spirit Distillery bar copy is copied verbatim from corporate — do not rewrite it.
- Every content task ends with `npm run build` succeeding and a live-browser DOM check (this codebase has no unit test suite — verification is build + real browser, matching how the corporate site was built and verified throughout its whole history).

---

## File Structure

New repo `general-catering-landing/` (forked from `miaso-corporate-landing/`), files that change from the fork baseline:

- `index.html` — title/meta/OG tags, CNAME target reference
- `public/CNAME` — `catering.miaso.ca`
- `src/components/Hero.jsx` — new headline/copy (JSX only, `Hero.css` untouched)
- `src/components/StatsBar.jsx` — new heading + stat labels
- `src/components/CateringOptions.jsx` — new `OPTIONS` array (4 items, each gets a new `price` field), new bar banner copy (unchanged from corporate), `CateringCard` gets one new `<span className="catering-card__price">` element
- `src/components/CateringOptions.css` — one new `.catering-card__price` rule
- `src/components/WhyMiaso.jsx` — new checklist array
- `src/components/HowItWorks.jsx` — new 4-step copy
- `src/components/FAQ.jsx` — new `FAQS` array
- `src/components/FinalForm.jsx` — new `EVENT_TYPES`, `CATERING_FORMATS`, `BUDGET_RANGES` arrays
- `src/components/Footer.jsx` — tagline text only
- `src/lib/submitLead.js` — payload gains a `site: 'catering'` constant field

Existing repo `miaso-corporate-landing/` (shared Apps Script), files that change:

- `apps-script/Code.gs` — `getSheet()` and `sendTelegramNotification()` branch on `payload.site`
- `src/lib/submitLead.js` — payload gains a `site: 'corporate'` constant field (so both sites always send an explicit value, never relying on "absence means corporate")

---

## Task 1: Fork the repository and rebrand site identity

**Files:**
- Create: new GitHub repo `miaso-ca/general-catering-landing` (client's GitHub account, same one hosting `miaso-ca/corporate-landing`)
- Modify: `index.html`
- Modify: `public/CNAME`
- Modify: `package.json:2` (`name` field)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a buildable, deployable fork that later tasks edit content in. All later tasks assume this repo exists locally at `/Users/serhiihatlan/Desktop/Cloude Code/general-catering-landing` and is a clean copy of corporate's `main` branch as of commit `851fa4a`.

- [ ] **Step 1: Create the new repo and clone corporate as its starting point**

```bash
gh repo create miaso-ca/general-catering-landing --private --clone -y
cd /Users/serhiihatlan/Desktop/Cloude\ Code
rsync -a --exclude='.git' --exclude='node_modules' --exclude='dist' \
  miaso-corporate-landing/ general-catering-landing/
cd general-catering-landing
git add -A
git commit -m "Fork miaso-corporate-landing as the base for catering.miaso.ca"
git push origin main
```

- [ ] **Step 2: Update `public/CNAME`**

```
catering.miaso.ca
```

- [ ] **Step 3: Update `package.json` name field**

Find `"name": "miaso-corporate-landing"` and change to:

```json
"name": "general-catering-landing",
```

- [ ] **Step 4: Update `index.html` title/meta/OG tags**

Replace the `<head>` content-identity block (title through twitter:image) with:

```html
<title>MIASO Catering — Toronto &amp; GTA</title>
<meta name="description" content="Beautiful, fresh catering for weddings, showers, brunches and every celebration in Toronto and the GTA. Grazing tables, charcuterie boards, full-service catering and more." />

<meta property="og:type" content="website" />
<meta property="og:title" content="MIASO Catering — Toronto & GTA" />
<meta property="og:description" content="Beautiful, fresh catering for weddings, showers, brunches and every celebration in Toronto and the GTA." />
<meta property="og:image" content="/og-image.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="MIASO Catering — Toronto & GTA" />
<meta name="twitter:description" content="Beautiful, fresh catering for weddings, showers, brunches and every celebration in Toronto and the GTA." />
<meta name="twitter:image" content="/og-image.jpg" />
```

Leave the Meta Pixel script, GA4 script, and favicon links exactly as copied (same Pixel ID `1650470559273087`, same GA4 ID `G-SS6HTCGBYL` — no new tracking IDs per spec).

- [ ] **Step 5: Verify it still builds**

```bash
npm install
npm run build
```

Expected: `✓ built in <time>` with no errors, `dist/index.html` contains "MIASO Catering — Toronto & GTA".

- [ ] **Step 6: Commit**

```bash
git add index.html public/CNAME package.json
git commit -m "Rebrand site identity for catering.miaso.ca"
git push origin main
```

---

## Task 2: Hero, StatsBar and Footer copy

**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/StatsBar.jsx`
- Modify: `src/components/Footer.jsx`

**Interfaces:**
- Consumes: nothing new (both components already accept `onRequestQuote`/`onWatchVideo` props from `App.jsx`, unchanged)
- Produces: nothing new (leaf content components)

- [ ] **Step 1: Rewrite Hero copy**

In `src/components/Hero.jsx`, replace the pill/h1/desc/trust text (keep every className, every `nbsp`-guarded phrase pattern, every `reveal` wrapper exactly as-is — only the strings inside change):

```jsx
<span
  className={`pill pill--on-photo reveal reveal--fast ${
    eyebrow.visible ? 'reveal--visible' : ''
  }`}
  ref={eyebrow.ref}
>
  Catering in Toronto &amp;&nbsp;GTA
</span>
<h1
  className={`hero__title reveal reveal--rise ${
    headline.visible ? 'reveal--visible' : ''
  }`}
  ref={headline.ref}
>
  Beautiful Hosting, Made&nbsp;Effortless
</h1>
```

```jsx
<p className="hero__desc">
  From grazing tables and charcuterie boards to full-service catering, MIASO
  brings fresh, beautifully styled food to your celebration — weddings,
  showers, birthdays and every gathering in between across Toronto and
  the GTA.
</p>
<div className="hero__actions">
  <button className="btn" type="button" onClick={onRequestQuote}>
    Request a&nbsp;Quote
  </button>
  <button className="hero__watch" onClick={onWatchVideo} type="button">
    <span className="hero__play">▶</span>
    Watch 45&nbsp;sec
  </button>
</div>
<div className="hero__trust">
  Made fresh to order · Flexible dietary options · Halal &amp; kosher-friendly
  substitutions available
</div>
```

- [ ] **Step 2: Rewrite StatsBar copy**

In `src/components/StatsBar.jsx`, keep the exact component structure and animation logic. Change only the heading and the 4th stat's label/value (ratings/count-up stats stay generic — 5.0★ and "4" format count still apply):

```jsx
<h2 className="stats-bar__heading">
  Every&nbsp;Celebration, Thoughtfully&nbsp;Handled
</h2>
```

For the fourth stat block (the one currently reading "Quote within / 1 business day"), keep the value/caption pair identical — this claim is true for both sites and doesn't need rewriting.

- [ ] **Step 3: Rewrite Footer tagline**

In `src/components/Footer.jsx`, change:

```jsx
<p className="footer__tagline">Toronto &amp; GTA · Catering for Every Celebration</p>
```

Leave `LINKS`, social hrefs, phone/email, and copyright text unchanged.

- [ ] **Step 4: Build and verify**

```bash
npm run build
npm run dev
```

Open the dev server in a browser, confirm the hero headline reads "Beautiful Hosting, Made Effortless", the StatsBar heading reads "Every Celebration, Thoughtfully Handled", and the footer tagline reads "Toronto & GTA · Catering for Every Celebration".

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.jsx src/components/StatsBar.jsx src/components/Footer.jsx
git commit -m "Rewrite Hero, StatsBar and Footer copy for general catering"
git push origin main
```

---

## Task 3: CateringOptions — 4 format cards with pricing + bar banner

**Files:**
- Modify: `src/components/CateringOptions.jsx`
- Modify: `src/components/CateringOptions.css`

**Interfaces:**
- Consumes: `useReveal` hook (unchanged), `QuickCaptureForm` component (unchanged)
- Produces: `.catering-card__price` CSS class other tasks don't depend on (leaf change)

- [ ] **Step 1: Replace the `OPTIONS` array and imports**

Photos: reuse 4 of corporate's existing photo files that already show the right subject matter (no new photo sourcing needed for this task — Boards/Platters can reuse `catering-platter-spread.jpg`, Grazing Tables reuses the same platter photo cropped differently is wrong; instead use `catering-cups-lineup.jpg` for Boards/Cups/Platters since it's literally cups+boards, `catering-platter-spread.jpg` for Grazing Tables, `catering-fullservice-tablewide.jpg` for Full Catering, `catering-cart-wide.jpg` for Mobile Cart):

```jsx
import './CateringOptions.css'
import QuickCaptureForm from './QuickCaptureForm.jsx'
import useReveal from '../hooks/useReveal.js'
import boardsPhoto from '../assets/photos/catering-cups-lineup.jpg'
import grazingPhoto from '../assets/photos/catering-platter-spread.jpg'
import fullCateringPhoto from '../assets/photos/catering-fullservice-tablewide.jpg'
import cartPhoto from '../assets/photos/catering-cart-wide.jpg'

const OPTIONS = [
  {
    title: 'Boards, Cups & Platters',
    description:
      'Delivered fully assembled, no setup needed — perfect for drop-off gifting, small gatherings and grab-and-go serving.',
    bestFor: 'gifting, small gatherings, drop-off orders',
    price: 'From $16.25/guest',
    photo: boardsPhoto,
    photoPosition: '50% 50%',
    alt: 'MIASO charcuterie cups and boards, individually portioned and ready to serve',
  },
  {
    title: 'Grazing Tables',
    description:
      'An artfully styled, self-serve spread built directly on your table — the visual centrepiece of any celebration.',
    bestFor: 'showers, brunches, home parties',
    price: 'From $38/guest',
    photo: grazingPhoto,
    photoPosition: '50% 50%',
    alt: 'A beautifully styled MIASO grazing table spread',
  },
  {
    title: 'Full Catering',
    description:
      'A structured, plated menu across salads, sandwiches, hot bites and dessert — with delivery, setup and cleanup included.',
    bestFor: 'weddings, private dinners, formal events',
    price: 'From $60/guest',
    // ponytail: reuses the same wide-card treatment corporate uses for its
    // own last-card-before-the-bar-banner - same 4-cards-then-bar parity,
    // same stranding problem, same fix.
    wide: true,
    photo: fullCateringPhoto,
    photoPosition: '50% 50%',
    alt: 'MIASO full-service catering table set for a formal event',
  },
  {
    title: 'Mobile Charcuterie Cart',
    description:
      'An interactive, staffed food station — charcuterie, salad or sandwich bar — that becomes the highlight of your event.',
    bestFor: 'showers, weddings, large celebrations',
    price: 'From $350 + $22/guest',
    photo: cartPhoto,
    photoPosition: '50% 52%',
    alt: 'MIASO mobile catering cart, staffed and styled at an outdoor event',
  },
]
```

Note: with 4 single-span cards, `wide: true` on the 4th card is **not** needed to fix stranding (2+2 already fills the grid evenly, matching the note in the plan header) — remove the `wide: true` line and the `photoPosition` stays `'50% 50%'` for Full Catering as a regular card. Only add `wide: true` back if a 5th format gets added later (see the corporate `CateringOptions.jsx` git history commit `851fa4a` for the reference implementation of the wide-card CSS if that becomes necessary).

- [ ] **Step 2: Add the price element to `CateringCard`**

In `CateringOptions.jsx`, inside `CateringCard`, add the price line between the description and the "Best for" pill:

```jsx
<p className="catering-card__desc">{option.description}</p>
{option.price && <p className="catering-card__price">{option.price}</p>}
<span className="pill pill--on-light catering-card__best-for">Best for: {option.bestFor}</span>
```

- [ ] **Step 3: Style the price line in `CateringOptions.css`**

Add after the `.catering-card__desc` rule:

```css
.catering-card__price {
  font-size: 15px;
  font-weight: 600;
  color: var(--cta);
  margin: 0 24px 12px;
}
```

- [ ] **Step 4: Update the bar banner and quote-block copy**

`BarCard` keeps the exact corporate text verbatim (confirmed factually true for both sites — do not reword). Update only the section heading and quote intro:

```jsx
<h2>Every Way to Host, Beautifully Catered</h2>
<p className="catering-options__intro">
  Whether you are planning a wedding, a baby shower, a brunch or a big
  celebration at home, MIASO can tailor the menu, presentation and level
  of service to your event.
</p>
```

```jsx
<h3>Let&rsquo;s Get You a Quote</h3>
<p className="catering-options__quote-intro">
  Share your details and we&rsquo;ll follow up within 1 business day. Have your guest
  count, budget or venue ready? <a href="#quote">Use the full quote form</a> instead.
</p>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
npm run dev
```

In the browser, confirm all 4 cards render with a red price line under each description, and the grid has no stranded/orphaned card (2 rows of 2, then the bar banner full-width on its own row — check via `document.querySelector('.catering-options__grid').children.length === 5` in devtools, and confirm no card sits alone next to empty space).

- [ ] **Step 6: Commit**

```bash
git add src/components/CateringOptions.jsx src/components/CateringOptions.css
git commit -m "Replace catering format cards with 4 general-catering formats + pricing"
git push origin main
```

---

## Task 4: WhyMiaso and HowItWorks copy

**Files:**
- Modify: `src/components/WhyMiaso.jsx`
- Modify: `src/components/HowItWorks.jsx`

**Interfaces:**
- Consumes: nothing new
- Produces: nothing new

- [ ] **Step 1: Rewrite the WhyMiaso checklist**

Find the checklist array/items in `WhyMiaso.jsx` (6 items, same pattern as corporate) and replace with:

```jsx
const CHECKLIST = [
  'Fresh, made-to-order ingredients',
  'Elegant presentation on boards, boats or trays',
  'Serving utensils and allergen labels available on request',
  'Peanut-free and shellfish-free options on any menu',
  'Halal & kosher-friendly substitutions available',
  'A clear quote with everything included — no surprises on the day',
]
```

Keep the surrounding heading structure; update the heading text to:

```jsx
<h2>You Host the Celebration → We Handle the&nbsp;Catering.</h2>
```

(Match whatever exact JSX wrapper/arrow-span pattern corporate's `WhyMiaso.jsx` uses — copy that pattern, only the words change.)

- [ ] **Step 2: Rewrite HowItWorks steps**

Replace the 4 `STEPS` entries with:

```jsx
const STEPS = [
  {
    number: '01',
    title: 'Select Your Service & Menu',
    description: 'Choose your format — boards, grazing table, full catering or the mobile cart — and pick your menu, or ask us to build one for you.',
  },
  {
    number: '02',
    title: 'Receive a Personalized Quote',
    description: "We'll prepare a detailed quote and, on request, a printed menu card tailored to your event.",
  },
  {
    number: '03',
    title: 'Confirm with a Deposit',
    description: 'Approve your quote and secure your date with a deposit — your booking is confirmed once it’s received.',
  },
  {
    number: '04',
    title: 'Enjoy Your Event, Stress-Free',
    description: 'We deliver, style and (depending on your package) serve and clean up — you just enjoy the day.',
  },
]
```

Keep the CTA button label as `Request a Quote` (matching whatever prop/handler `HowItWorks.jsx` already wires to `onRequestQuote`).

- [ ] **Step 3: Build and verify**

```bash
npm run build
npm run dev
```

Confirm both sections render the new copy with no layout break (checklist items don't overflow, step numbers/titles align as in corporate).

- [ ] **Step 4: Commit**

```bash
git add src/components/WhyMiaso.jsx src/components/HowItWorks.jsx
git commit -m "Rewrite WhyMiaso checklist and HowItWorks steps for general catering"
git push origin main
```

---

## Task 5: FAQ questions

**Files:**
- Modify: `src/components/FAQ.jsx`

**Interfaces:**
- Consumes: nothing new
- Produces: nothing new

- [ ] **Step 1: Replace the `FAQS` array**

```jsx
const FAQS = [
  {
    q: 'Is there a minimum guest count?',
    a: 'Boards & Platters have no minimum. Grazing Tables require a minimum of 15 guests, and Full Catering or the Mobile Cart require a minimum of 20 guests.',
  },
  {
    q: 'Do you deliver and set up, or is it self-serve?',
    a: 'It depends on the format. Boards & Platters are delivered fully assembled — just unwrap and serve. Grazing Tables and Full Catering include on-site delivery and setup. The Mobile Cart comes staffed for the full duration you book.',
  },
  {
    q: 'Can you accommodate dietary restrictions?',
    a: 'Yes. Peanut-free and shellfish-free options are available on any menu, and we offer halal and kosher-friendly substitutions on request — just let us know when you inquire.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'We recommend booking as early as possible, especially for weekend dates. Your date is confirmed once your quote is approved and the deposit is received.',
  },
  {
    q: 'Do you offer bar or beverage service too?',
    a: 'Yes. We offer self-serve pre-batched drinks starting at $3.50/drink, and full staffed bar service through our partnership with North Spirit Distillery — one booking, one point of contact.',
  },
  {
    q: 'How does the deposit and booking process work?',
    a: 'Select your service and menu, receive a personalized quote, approve it, and secure your date with a deposit. We’ll send an agreement to sign, and you’re all set.',
  },
]
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
npm run dev
```

Click through all 6 accordion items in the browser, confirm each opens/closes correctly and no answer text overflows its panel.

- [ ] **Step 3: Commit**

```bash
git add src/components/FAQ.jsx
git commit -m "Rewrite FAQ questions for general catering"
git push origin main
```

---

## Task 6: FinalForm field options

**Files:**
- Modify: `src/components/FinalForm.jsx`

**Interfaces:**
- Consumes: nothing new (same `submitLead`, `trackContact`, `useReveal` imports as corporate)
- Produces: nothing new — this is the last content-only task; Task 7 wires the payload's `site` field

- [ ] **Step 1: Replace `EVENT_TYPES`**

```jsx
const EVENT_TYPES = [
  'Wedding',
  'Birthday or Anniversary',
  'Baby or Bridal Shower',
  'Brunch or Home Gathering',
  'Office or Corporate Event',
  'Other',
]
```

- [ ] **Step 2: Replace `CATERING_FORMATS`**

```jsx
const CATERING_FORMATS = [
  'Boards, Cups & Platters',
  'Grazing Tables',
  'Full Catering',
  'Mobile Charcuterie Cart',
  'Bar / Beverage Add-On',
  'Not sure yet',
]
```

- [ ] **Step 3: Replace `BUDGET_RANGES`**

```jsx
const BUDGET_RANGES = [
  'Under $200',
  '$200 – $500',
  '$500 – $1,500',
  '$1,500 – $5,000',
  '$5,000+',
  'Not sure yet',
]
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
npm run dev
```

In the browser, open the full quote form, confirm the Event Type, Preferred Catering Format and Approximate Budget selects show exactly the 6/6/6 options above (use `[...document.querySelector('#final-eventType').options].map(o=>o.value)` in devtools to check each select).

- [ ] **Step 5: Commit**

```bash
git add src/components/FinalForm.jsx
git commit -m "Update form field options (event type, format, budget) for general catering"
git push origin main
```

---

## Task 7: Route leads by `site` — shared Apps Script + both sites' `submitLead.js`

**Files:**
- Modify (in `general-catering-landing/`): `src/lib/submitLead.js`
- Modify (in `miaso-corporate-landing/`, the **existing corporate repo**): `src/lib/submitLead.js`
- Modify (in `miaso-corporate-landing/`, **shared Apps Script source**): `apps-script/Code.gs`

**Interfaces:**
- Consumes: nothing new
- Produces: `payload.site` (`'catering'` | `'corporate'`), read by `Code.gs`'s `getSheet()` and `sendTelegramNotification()`

- [ ] **Step 1: Add `site` to the catering site's `submitLead.js` payload**

In `general-catering-landing/src/lib/submitLead.js`, find the `fetch` call's `body: JSON.stringify({ ...payload, eventId, ...getUtm() })` line and change to:

```js
body: JSON.stringify({ ...payload, eventId, site: 'catering', ...getUtm() }),
```

- [ ] **Step 2: Add `site` to the corporate site's `submitLead.js` payload**

In `miaso-corporate-landing/src/lib/submitLead.js` (the existing repo), same line, change to:

```js
body: JSON.stringify({ ...payload, eventId, site: 'corporate', ...getUtm() }),
```

This makes every future lead from either site carry an explicit `site` value — no lead ever relies on "missing field means corporate."

- [ ] **Step 3: Update `Code.gs`'s `SHEET_NAME` constant to a lookup**

In `miaso-corporate-landing/apps-script/Code.gs`, replace:

```js
var SHEET_NAME = 'Leads';
```

with:

```js
var SHEET_NAMES = {
  corporate: 'Leads',
  catering: 'Catering Leads',
};
```

- [ ] **Step 4: Update `getSheet()` to take a sheet name parameter**

Replace the existing `getSheet()` function:

```js
function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(COLUMNS);
    return sheet;
  }

  var lastCol = sheet.getLastColumn();
  var existingHeader = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  if (existingHeader.length < COLUMNS.length) {
    var missing = COLUMNS.slice(existingHeader.length);
    sheet.getRange(1, existingHeader.length + 1, 1, missing.length).setValues([missing]);
  }
  return sheet;
}
```

- [ ] **Step 5: Update `appendToSheet()` to resolve the sheet name from `payload.site`**

```js
function appendToSheet(payload) {
  var sheetName = SHEET_NAMES[payload.site] || SHEET_NAMES.corporate;
  var sheet = getSheet(sheetName);
  var row = COLUMNS.map(function (key) {
    if (key === 'timestamp') return new Date();
    return sheetSafe(payload[key] || '');
  });
  sheet.appendRow(row);
}
```

- [ ] **Step 6: Add a second Telegram thread-id property lookup**

In `sendTelegramNotification()`, replace:

```js
  var threadId = props.getProperty('TELEGRAM_THREAD_ID');
  if (threadId) body.message_thread_id = Number(threadId);
```

with:

```js
  var threadIdKey = payload.site === 'catering' ? 'TELEGRAM_THREAD_ID_CATERING' : 'TELEGRAM_THREAD_ID';
  var threadId = props.getProperty(threadIdKey);
  if (threadId) body.message_thread_id = Number(threadId);
```

- [ ] **Step 7: Update the header doc comment**

At the top of `Code.gs`, in the Script Properties list, add:

```
 *   TELEGRAM_THREAD_ID_CATERING - forum topic id for catering.miaso.ca leads
 *                                  in the same Telegram group (optional,
 *                                  only if that group uses topics and
 *                                  catering leads should land in their own)
```

- [ ] **Step 8: Verify locally with a dry read**

```bash
cd "/Users/serhiihatlan/Desktop/Cloude Code/miaso-corporate-landing"
grep -n "SHEET_NAMES\|threadIdKey\|payload.site" apps-script/Code.gs
```

Expected: all 4 new references present, no leftover references to the old single `SHEET_NAME` constant (`grep -n "SHEET_NAME " apps-script/Code.gs` should return nothing).

- [ ] **Step 9: Commit both repos**

```bash
cd "/Users/serhiihatlan/Desktop/Cloude Code/general-catering-landing"
git add src/lib/submitLead.js
git commit -m "Send explicit site: 'catering' on every lead submission"
git push origin main

cd "/Users/serhiihatlan/Desktop/Cloude Code/miaso-corporate-landing"
git add src/lib/submitLead.js apps-script/Code.gs
git commit -m "Route leads to per-site Sheet tab and Telegram topic by payload.site"
git push origin main
```

- [ ] **Step 10: Redeploy Apps Script (manual step, same as every previous Code.gs change)**

Tell the user: paste the updated `Code.gs` into the Apps Script editor for the shared deployment, then **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. Before that, they (or whoever has access to the client's Telegram group) need to create a new topic in the existing MIASO leads Telegram group for catering leads (or decide to skip a dedicated topic and let catering leads land in General), and add a `TELEGRAM_THREAD_ID_CATERING` Script Property with that topic's id if they want one. This step cannot be done by the agent — it needs the human's Apps Script editor access, same as the corporate site's Code.gs updates always have.

---

## Task 8: Deploy pipeline and end-to-end verification

**Files:**
- Verify: `.github/workflows/deploy.yml` (should already exist from the fork, unmodified)
- No new files

**Interfaces:**
- Consumes: everything from Tasks 1–7
- Produces: a live site at `catering.miaso.ca` with a working, routed lead pipeline

- [ ] **Step 1: Confirm the GitHub Actions workflow exists and targets the right repo**

```bash
cd "/Users/serhiihatlan/Desktop/Cloude Code/general-catering-landing"
cat .github/workflows/deploy.yml
```

Expected: same workflow as corporate's (build on push to `main`, deploy to GitHub Pages) — no edits needed since it was copied by the `rsync` in Task 1.

- [ ] **Step 2: Push a build and poll for deploy success**

```bash
git push origin main
```

```bash
until RESULT=$(gh run list --repo miaso-ca/general-catering-landing --limit 1 --json status,conclusion,headSha -q '.[0].status + " " + .[0].conclusion + " " + .[0].headSha[0:7]') && [[ "$RESULT" == completed* ]]; do sleep 8; done
echo "$RESULT"
```

Expected: `completed success <sha>`.

- [ ] **Step 3: Tell the user to add the CNAME DNS record**

Same as corporate's original setup: user adds a `CNAME` record for `catering` pointing at GitHub Pages in GoDaddy (or wherever `miaso.ca`'s DNS is managed). This cannot be done by the agent — it's the user's own DNS/domain account.

- [ ] **Step 4: Once DNS resolves, run a real end-to-end lead test**

```js
// In the browser devtools console on https://catering.miaso.ca (or via the
// Browser tool's javascript_tool, same pattern used for corporate's own
// end-to-end tests)
const url = 'https://script.google.com/macros/s/AKfycbx9hByc4kOO0B9WL73Dg-H0vhRc82x8U47biaO16Ph1cZWLUDq9tWAJPj64x59RQ66w6Q/exec';
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({
    source: 'test-catering-e2e',
    site: 'catering',
    name: 'Catering Site Test',
    email: 'catering-e2e-test@example.com',
    phone: '+14165551111',
    eventType: 'Wedding',
    format: 'Grazing Tables',
  }),
});
await res.text()
```

Expected response: `{"ok":true,"channels":{"sheet":true,"email":true,"telegram":true}}`.

- [ ] **Step 5: Confirm routing manually**

Ask the user to check that "Catering Site Test" appears in the **"Catering Leads"** tab of the Sheet (not "Leads"), and in the correct Telegram topic (or General, if no dedicated topic was set up) — not mixed into corporate's existing leads.

- [ ] **Step 6: Real-form test through the live site**

Repeat the same live-browser form-fill-and-submit test used for corporate (fill `QuickCaptureForm` and `FinalForm` with real-looking data via the DOM, click submit, confirm the success message appears and `fbq('track','Lead',...)` fires exactly once per submission) — same technique as corporate's own end-to-end verification, just pointed at `catering.miaso.ca`.

- [ ] **Step 7: Final commit (if any fixes were needed during verification)**

```bash
cd "/Users/serhiihatlan/Desktop/Cloude Code/general-catering-landing"
git add -A
git commit -m "Fix issues found during end-to-end verification"
git push origin main
```

(Skip this step if no fixes were needed.)
