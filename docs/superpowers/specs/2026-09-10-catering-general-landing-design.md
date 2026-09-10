# MIASO General Catering Landing — catering.miaso.ca

## Мета

Друга посадкова сторінка MIASO, окремий сабдомен `catering.miaso.ca`, під ширшу аудиторію ніж корпоративний `events.miaso.ca`: весілля, дні народження, бебі/бридал шауери, бранчі, домашні вечірки, і — легшим дотиком — офісні/корпоративні події (без конкуренції з платною корпоративною кампанією на `events.miaso.ca`). Джерело копірайту й цін — клієнтський прайс-гайд `MIASO_Pricing_Guide_2026.pptx.pdf`.

Дизайн, компонентна структура і CSS повністю копіюються з `miaso-corporate-landing` — змінюється тільки контент (тексти, формати, ціни, форма).

## Вимоги

1. **Окремий git-репозиторій**, форк поточного коду `miaso-corporate-landing` (не спільний конфігурований codebase на два сайти). Деплой: GitHub Actions → GitHub Pages → CNAME `catering.miaso.ca`.
2. **4 картки формату** (замість 5 у corporate) + банер бару, у тій самій сітці 2 колонки:
   - Boards, Cups & Platters — "From $16.25/guest"
   - Grazing Tables — "From $38/guest"
   - Full Catering — "From $60/guest"
   - Mobile Charcuterie Cart — "From $350 + $22/guest"
   Кожна картка показує стартову ціну (на відміну від corporate, де цін немає взагалі) — окремий текстовий елемент у картці, не зламавши наявну верстку `.catering-card`.
3. **Банер North Spirit Distillery** — той самий текст, що на corporate (партнерство однакове для обох сайтів), той самий "on-brand-red, full-width" стиль.
4. **Форма заявки** (той самий компонент `FinalForm`, нові дані):
   - `eventType`: Wedding, Birthday & Anniversary, Baby/Bridal Shower, Brunch & Home Gathering, Office/Corporate Event, Other
   - `format`: 4 формати вище + "Bar / Beverage Add-On" + "Not sure yet"
   - `budget`: нижчі пороги, що відповідають реальному входу з гайду (не $500 як мінімум у corporate) — орієнтовно Under $200 / $200–$500 / $500–$1,500 / $1,500–$5,000 / $5,000+ / Not sure yet
   - решта полів (name/email/phone/company опційно/eventDate/guests/venue/dietary/details) — без змін структурно
5. **Короткі quick-capture форми** (той самий компонент `QuickCaptureForm`) лишаються на тих самих місцях у структурі сторінки (після блоку форматів, після блоку "як це працює").
6. **Ліди йдуть у ту саму інфраструктуру**, що й corporate:
   - Той самий Apps Script Web App (один спільний `Code.gs`, не новий деплой)
   - Той самий Google Sheet-файл, нова вкладка (`Catering Leads`, окремо від `Leads`)
   - Той самий Telegram-чат, нова гілка (новий `TELEGRAM_THREAD_ID_CATERING`, окремий від corporate)
   - Розрізнення відбувається по полю `site` (нове, наприклад `'catering'` vs `'corporate'`), яке `Code.gs` читає, щоб вибрати вкладку Sheet і гілку Telegram
7. **Трекінг**: той самий Meta Pixel ID і GA4 Measurement ID, що на corporate (одна компанія — один піксель). Розрізнення кампаній — через UTM і `source`, без нового піксель-ID.
8. **Копірайт**: теплий/святковий тон (не B2B-efficiency, а "beautiful hosting made effortless" з самого гайду). WhyMiaso-чеклист бере реальні пункти з гайду: fresh made-to-order, elegant presentation, allergen labels on request, peanut/shellfish-free options, halal/kosher-friendly substitutions.
9. **Відгуки**: ті самі реальні відгуки, що на corporate (нових поки немає, не вигадувати нові).
10. **FAQ**: нові питання під приватні події (не корпоративні) — мінімальні пороги гостей за форматом, чи можна кастомізувати меню, як працює депозит/крайні терміни (з розділу гайду "Steps to Secure Your Service").

## Обмеження

- Не міняти жоден React-компонент структурно — тільки контент/дані (`OPTIONS`, `FIELDS`, копірайт-рядки).
- Не показувати exact ціни за розмір дошки (XXS $85 і т.д.) на самій лендінг-сторінці — тільки узагальнені "From $X/guest" на картках; детальний прайс — предмет розмови в quote-формі, не публічний прайс-лист.
- `events.miaso.ca` (corporate) залишається без змін — жодних правок туди в межах цієї роботи.
- North Spirit Distillery копірайт (partnered for years/every event/one point of contact) лишається дослівно таким самим — вже підтверджено фактично правдивим.

## Крайні випадки

- **Заявка без вибраного event type** → required-поле, як і зараз у corporate.
- **Одна й та сама людина лишає заявку і на corporate, і на catering** → нормально, це два різні `source`/`site`, дублікат не проблема (різні наміри).
- **Формат картки з ціною не влазить у наявну верстку `.catering-card`** → додати ціну як маленький текстовий рядок під "Best for:" пігулкою, не міняючи розміри/пропорції фото.

## Готово, коли

- [ ] Новий репозиторій створено, форкнутий з поточного коду, деплоїться на GitHub Pages
- [ ] `catering.miaso.ca` відкривається після додавання CNAME (робить користувач сам, як і для events.miaso.ca)
- [ ] Усі 8 блоків мають новий копірайт з гайду, точні цифри цін збігаються з гайдом
- [ ] 4 картки формату + банер бару — без "сирітки" в сітці
- [ ] Форма з новими event type/format/budget опціями, валідація працює як на corporate
- [ ] Тестовий сабміт обох форм реально створює рядок у новій вкладці Sheet + гілці Telegram + email
- [ ] Meta Pixel/GA4 events працюють (Lead, Contact, SocialClick) — той самий Pixel ID
- [ ] `npm run build` проходить без помилок
