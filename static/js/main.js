// ═══════════════════════════════════════════════════════
//  main.js — Epic Quest (Астана + Актобе)
// ═══════════════════════════════════════════════════════

const WA_NUMBER = '77782836670';
const LATE_HOUR_ASTANA = 21;
const LATE_HOUR_AKTOBE = 20;

const PRICES_ASTANA = { 2: 14000, 3: 15000, 4: 18000 };
const PRICES_AKTOBE = { 2: 8000, 3: 9000, 4: 12000 };

function getAktobePrice(players) {
  if (!players || players < 2) return 0;
  if (PRICES_AKTOBE[players]) return PRICES_AKTOBE[players];
  return players * 2500;
}

const QUEST_PLAYER_LIMITS = {
  'traditions': 7, 'astral': 10, 'saw': 10,
  'poltergeist': 15, 'granny': 10, 'stranger': 15,
  'squid': 10, 'hostel666': 15, 'experiment_astral': 15,
};

// ── ГОРОД ──────────────────────────────────────────────
function getCurrentCity() {
  return localStorage.getItem('epic_city') || 'astana';
}

function setCurrentCity(city) {
  if (city !== 'astana' && city !== 'aktobe') return;
  localStorage.setItem('epic_city', city);
  applyCityToUI(city);
  renderQuestCards();
  renderPackagesForCity(city);
  updateContactsForCity(city);
  updateCityToggleUI(city);
}

function applyCityToUI(city) {
  const heroTag = document.querySelector('.hero-tag');
  if (heroTag) {
    heroTag.textContent = city === 'aktobe'
      ? 'Актобе · на рынке с 2016 года, построили 24 квеста'
      : 'Астана · на рынке с 2016 года, построили 24 квеста';
  }
  // Число квестов в hero-stats: 10 для обоих городов
  const questCountEl = document.querySelector('.hero-stat [data-count]');
  if (questCountEl) {
    questCountEl.textContent = '10';
    questCountEl.dataset.count = '10';
  }
}

function updateCityToggleUI(city) {
  document.querySelectorAll('.city-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.city === city);
  });
}

function updateContactsForCity(city) {
  const cfg = (typeof CITIES !== 'undefined') ? CITIES[city] : null;
  if (!cfg) return;
  const hoursEl = document.querySelector('[data-city-hours]');
  if (hoursEl) hoursEl.textContent = cfg.hours;
  const addrEl = document.querySelector('[data-city-address]');
  if (addrEl) addrEl.textContent = cfg.address;
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('solid', window.scrollY > 50);
}, { passive: true });

window.addEventListener('scroll', () => {
  document.getElementById('btnTop')?.classList.toggle('is-visible', window.scrollY > 400);
}, { passive: true });

// ── УТИЛИТЫ ────────────────────────────────────────────
function calcPrice(players, timeStr, questName = '', city = null) {
  if (!players || players < 2) return 0;
  city = city || getCurrentCity();

  if (questName === 'Дом Эмоций: Комната Любви и Примирения') {
    if (players === 2) return 25000;
    if (players === 4) return 35000;
    return 0;
  }

  if (city === 'aktobe') {
    const base = getAktobePrice(players);
    const lateExtra = (players <= 3) && isLateTime(timeStr, city) ? 3000 : 0;
    return base + lateExtra;
  }

  const base = PRICES_ASTANA[players] ?? players * 4000;
  const late = (players <= 3) && isLateTime(timeStr, city) ? 4000 : 0;
  return base + late;
}

function isLateTime(timeStr, city = null) {
  if (!timeStr) return false;
  city = city || getCurrentCity();
  const lateHour = city === 'aktobe' ? LATE_HOUR_AKTOBE : LATE_HOUR_ASTANA;
  const [h] = timeStr.split(':').map(Number);
  return h >= lateHour || h < 4;
}

function fmt(n) { return n.toLocaleString('ru-RU'); }

function playersLabel(n) {
  if (n === 1) return 'игрок';
  if (n < 5)  return 'игрока';
  return 'игроков';
}

function guestsLabel(n) {
  if (n < 5) return 'гостя';
  return 'гостей';
}

function buildOptions(select, min, max, label) {
  select.innerHTML = '<option value="">Выберите</option>';
  for (let i = min; i <= max; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} ${label(i)}`;
    select.appendChild(opt);
  }
}

function getMinPriceForQuest(q) {
  if (q.id === 'emotions') return '25 000';
  if (q.city === 'aktobe') return '8 000';
  return '14 000';
}

// ── РЕНДЕР КАРТОЧЕК ────────────────────────────────────
function renderQuestCards() {
  const grid = document.getElementById('questsGrid');
  if (!grid) return;

  const city = getCurrentCity();
  const filteredQuests = QUESTS.filter(q => q.city === city);

  if (filteredQuests.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Квесты в этом городе скоро появятся</p>';
    return;
  }

  grid.innerHTML = filteredQuests.map(q => {
    const minPrice = getMinPriceForQuest(q);
    return `
    <article class="quest-card" role="listitem" onclick="location.href='quest.html?id=${q.id}'" aria-label="${q.name}">
      <div class="qcard-img">
        <img src="${q.img}" alt="${q.name}" loading="lazy" onerror="this.parentElement.style.background='#1a0505'">
        <div class="qcard-overlay"></div>
        <span class="qcard-tag" style="background:${q.tagColor}">${q.tag}</span>
      </div>
      <div class="qcard-body">
        <p class="qcard-genre">${q.genre}</p>
        <h3 class="qcard-name">${q.name}</h3>
        <p class="qcard-desc">${q.desc}</p>
        <div class="qcard-meta">
          <span class="qcard-meta-item"><span class="qcard-meta-icon">👥</span> ${q.players}</span>
          <span class="qcard-meta-item"><span class="qcard-meta-icon">⏱</span> ${q.duration} мин</span>
        </div>
        <div class="qcard-footer">
          <span class="qcard-price">от <strong>${minPrice} ₸</strong></span>
          <button class="btn-card-book" onclick="event.stopPropagation(); openModal('${q.name}')">Забронировать</button>
        </div>
      </div>
    </article>
  `}).join('');

  requestAnimationFrame(() => {
    document.querySelectorAll('.quest-card').forEach((card, i) => {
      card.style.cssText = `opacity:0;transform:translateY(40px);transition:opacity .6s ${i * .08}s ease,transform .6s ${i * .08}s ease`;
      cardObserver.observe(card);
    });
  });
}

const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      cardObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

// ── ПАКЕТЫ ─────────────────────────────────────────────
const PACKAGES = {
	'ЛЕГЕНДА': { city: 'astana', price_week: 130000, price_weekend: 180000, max: 15, duration: '4 часа', extra: 7500,
    items: ['Квест «Очень Странные Дела 2»', 'Квест «Бабушка Грэнни»', 'Шоу программа с ведущим и ди-джеем — 6 весёлых игр от @epik_show', 'Настольные игры, Мафия, Прятки в темноте', 'Эпичное поздравление / вынос торта', 'Фуршет с вашей едой', 'Электронные пригласительные', 'Полная аренда 3-х этажного коттеджа', 'Мобилограф'] },
  'ПРАЙМ':   { city: 'astana', price_week: 99000,  price_weekend: 120000, max: 10, duration: '3 часа', extra: 5000,
    items: ['Квест «Очень Странные Дела 2»', 'Квест «Бабушка Грэнни»', 'Настольные игры', 'Эпичный вынос торта', 'Фуршет с вашей едой', 'Электронные пригласительные', 'Полная аренда 3-х этажного коттеджа', 'Мобилограф'] },
  'ПОЛТЕР':  { city: 'astana', price_week: 89000,  price_weekend: 110000, max: 15, duration: '3 часа',
    items: ['Квест «Полтергейст»', 'Квест «Побег из Астрала»', 'Настольные игры', 'Эпичный вынос торта', 'Электронные пригласительные', 'Полная аренда помещения', 'Мобилограф'] },
  'ПИЛА':    { city: 'astana', price_week: 56000,  price_weekend: 70000,  max: 10, duration: '2 часа',
    items: ['Квест «Пила»', 'Настольные игры', 'Эпичный вынос торта', 'Электронные пригласительные', 'Полная аренда помещения', 'Мобилограф'] },
  'МТ':      { city: 'astana', price_week: 56000,  price_weekend: 70000,  max: 7,  duration: '2 часа',
    items: ['Квест «Мрачные Традиции»', 'Настольные игры', 'Эпичный вынос торта', 'Электронные пригласительные', 'Полная аренда помещения', 'Мобилограф'] },
  'ПРАЙМ_АКТОБЕ':   { city: 'aktobe', price_week: 75000,  price_weekend: 99000,  max: 10, duration: '3 часа', extra: 4000, displayName: 'ПРАЙМ',
    items: ['Квест «Эксперимент Астрал»', 'Квест «HOSTEL 666»', 'Настольные игры', 'Эпичный вынос торта', 'Фуршет с вашей едой', 'Электронные пригласительные', 'Полная аренда 400 кв метров', 'Мобилограф'] },
  'ЛЕГЕНДА_АКТОБЕ': { city: 'aktobe', price_week: 99000,  price_weekend: 140000, max: 15, duration: '4 часа', extra: 5000, displayName: 'ЛЕГЕНДА',
    items: ['Квест «Эксперимент Астрал»', 'Квест «HOSTEL 666»', 'Шоу программа с ведущим и ди-джеем — 6 весёлых игр от @epik_show', 'Настольные игры, Мафия, Прятки в темноте', 'Эпичное поздравление / вынос торта', 'Фуршет с вашей едой', 'Электронные пригласительные', 'Полная аренда 400 кв метров', 'Мобилограф'] }
};

function renderPackagesForCity(city) {
  const grid = document.getElementById('packagesGrid');
  if (!grid) return;

  const filtered = Object.entries(PACKAGES).filter(([_, p]) => p.city === city);

  grid.innerHTML = filtered.map(([key, pkg]) => {
    const isGold = key.startsWith('ПРАЙМ');
    const isLegend = key.startsWith('ЛЕГЕНДА');
    const cardClass = isGold ? 'pkg-card pkg-card-gold' : isLegend ? 'pkg-card pkg-card-legend' : 'pkg-card';
    const displayName = pkg.displayName || key;
    const extraLine = pkg.extra ? `<span class="pkg-meta-extra">➕ Доп. места: ${fmt(pkg.extra)} тг/чел</span>` : '';

    return `
      <div class="${cardClass}">
        <div class="pkg-header">ПАКЕТ: ${displayName}</div>
        <ul class="pkg-list">
          ${pkg.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <div class="pkg-meta">
          <span>Длительность: ${pkg.duration} · До ${pkg.max} чел</span>
          ${extraLine}
        </div>
        <div class="pkg-prices">
          <div class="pkg-price-row">Будние: <strong>${fmt(pkg.price_week)} тг</strong></div>
          <div class="pkg-price-row pkg-weekend">Выходные: <strong>${fmt(pkg.price_weekend)} тг</strong></div>
        </div>
        <button class="btn-pkg" onclick="openPackageModal('${key}')">Забронировать</button>
      </div>
    `;
  }).join('');
}

// ── МОДАЛКА КВЕСТА ─────────────────────────────────────
function openModal(questName) {
  const q = QUESTS.find(x => x.name === questName);
  if (!q) return;

  if (q.id === 'emotions') {
    window.location.href = 'emotions-booking.html';
    return;
  }

  const city = q.city;
  document.getElementById('modalQuestName').textContent = questName;

  const playersSelect = document.getElementById('fPlayers');
  const overlay = document.getElementById('modalOverlay');
  const priceRowsContainer = overlay ? overlay.querySelector('.price-rows') : null;

  const maxP = QUEST_PLAYER_LIMITS[q.id] ?? q.maxPlayers ?? 20;

  playersSelect.innerHTML = '<option value="">Выберите</option>';
  for (let i = 2; i <= maxP; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} ${playersLabel(i)}`;
    playersSelect.appendChild(opt);
  }

  overlay.dataset.city = city;

  if (priceRowsContainer) {
    if (city === 'aktobe') {
      priceRowsContainer.innerHTML = `
        <div class="price-row"><span>2 человека</span><span class="price-val">8 000 ₸</span></div>
        <div class="price-row"><span>3 человека</span><span class="price-val">9 000 ₸</span></div>
        <div class="price-row"><span>4 человека</span><span class="price-val">12 000 ₸</span></div>
        <div class="price-row"><span>5–${maxP} человек</span><span class="price-val">2 500 ₸/чел</span></div>
        <div class="price-row price-row-note"><span>⏰ После 20:00 (2–3 чел.)</span><span class="price-val">+3 000 ₸</span></div>
      `;
    } else {
      priceRowsContainer.innerHTML = `
        <div class="price-row"><span>2 человека</span><span class="price-val">14 000 ₸</span></div>
        <div class="price-row"><span>3 человека</span><span class="price-val">15 000 ₸</span></div>
        <div class="price-row"><span>4 человека</span><span class="price-val">18 000 ₸</span></div>
        <div class="price-row"><span>5–${maxP} человек</span><span class="price-val">4 000 ₸/чел</span></div>
        <div class="price-row price-row-note"><span>⏰ После 21:00 (2–3 чел.)</span><span class="price-val">+4 000 ₸</span></div>
      `;
    }
  }

  document.getElementById('priceCalc').textContent = 'Выберите количество игроков';
  document.getElementById('priceCalc').className = 'price-calc';
  document.getElementById('agreeCheck').checked = false;

  const phone = document.getElementById('fPhone');
  phone.value = '';
  phone.style.borderColor = '';

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('fDate');
  dateInput.min = today;
  if (!dateInput.value) dateInput.value = today;

  const bdayNote = document.getElementById('birthdayNote');
  if (bdayNote) bdayNote.style.display = 'block';

  openOverlay('modalOverlay');
}

function closeModal() { closeOverlay('modalOverlay'); }

function openPackageModal(pkgKey) {
  const pkg = PACKAGES[pkgKey];
  if (!pkg) return;

  const displayName = pkg.displayName || pkgKey;
  document.getElementById('modalPackageName').textContent = 'Пакет: ' + displayName;
  document.getElementById('packageInfo').textContent =
    `Будние: ${fmt(pkg.price_week)} тг  |  Выходные: ${fmt(pkg.price_weekend)} тг  |  До ${pkg.max} человек`;

  buildOptions(document.getElementById('pGuests'), 2, pkg.max, guestsLabel);

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('pDate');
  dateInput.min = today;
  dateInput.value = today;

  document.getElementById('pName').value = '';
  document.getElementById('pPhone').value = '';
  document.getElementById('pComment').value = '';
  document.getElementById('pAgreeCheck').checked = false;

  document.getElementById('modalPackageOverlay').dataset.pkgKey = pkgKey;
  document.getElementById('modalPackageOverlay').dataset.city = pkg.city;

  openOverlay('modalPackageOverlay');
}

function closePackageModal() { closeOverlay('modalPackageOverlay'); }

function openOverlay(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

function formatPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (!v) { input.value = ''; input.style.borderColor = ''; return; }
  if (v[0] === '8') v = '7' + v.slice(1);

  let r = '';
  if (v[0] === '7') {
    v = v.slice(0, 11);
    r = '+7';
    if (v.length > 1) r += ' (' + v.slice(1, 4);
    if (v.length >= 5) r += ') ' + v.slice(4, 7);
    if (v.length >= 8) r += '-' + v.slice(7, 9);
    if (v.length >= 10) r += '-' + v.slice(9, 11);
  } else {
    r = '+' + v.slice(0, 15);
  }

  input.value = r;
  const digits = v.replace(/\D/g, '');
  input.style.borderColor = digits.length >= 11 ? '#2a7a3a' : '#cc1111';
}

function updatePrice() {
  const questName = document.getElementById('modalQuestName').textContent;
  const city = document.getElementById('modalOverlay').dataset.city || 'astana';
  const players = parseInt(document.getElementById('fPlayers').value) || 0;
  const time = document.getElementById('fTime')?.value || '';
  const calc = document.getElementById('priceCalc');
  if (!calc) return;

  if (!players) {
    calc.textContent = 'Выберите количество игроков';
    calc.className = 'price-calc';
    return;
  }

  const total = calcPrice(players, time, questName, city);
  const isEmotions = questName === 'Дом Эмоций: Комната Любви и Примирения';
  let extraLabel = '';

  if (!isEmotions && isLateTime(time, city) && players <= 3) {
    if (city === 'aktobe') {
      extraLabel = ` (+3 000 ₸ после 20:00)`;
    } else {
      extraLabel = ` (+4 000 ₸ после 21:00)`;
    }
  }

  calc.textContent = `💰 Итого: ${fmt(total)} ₸${extraLabel}`;
  calc.className = 'price-calc price-calc-active';
}

function validateFields(fields) {
  for (const { id, check, msg } of fields) {
    const el = document.getElementById(id);
    if (!el || !check(el.value.trim())) return msg;
  }
  return null;
}

const QUEST_FIELDS = [
  { id: 'fName',    check: v => v.length > 0,                    msg: 'Введите ваше имя' },
  { id: 'fPhone',   check: v => v.replace(/\D/g,'').length >= 10, msg: 'Введите корректный номер телефона' },
  { id: 'fDate',    check: v => v.length > 0,                    msg: 'Выберите дату' },
  { id: 'fTime',    check: v => v.length > 0,                    msg: 'Выберите время' },
  { id: 'fPlayers', check: v => v.length > 0,                    msg: 'Выберите количество игроков' },
];

const PKG_FIELDS = [
  { id: 'pName',   check: v => v.length > 0,                    msg: 'Введите ваше имя' },
  { id: 'pPhone',  check: v => v.replace(/\D/g,'').length >= 10, msg: 'Введите корректный телефон' },
  { id: 'pDate',   check: v => v.length > 0,                    msg: 'Выберите дату' },
  { id: 'pTime',   check: v => v.length > 0,                    msg: 'Выберите время' },
  { id: 'pGuests', check: v => v.length > 0,                    msg: 'Выберите количество гостей' },
];

function sendWhatsApp() {
  const err = validateFields(QUEST_FIELDS);
  if (err) { showError('fError', 'modalOverlay', err); return; }

  const agree = document.getElementById('agreeCheck');
  if (agree && !agree.checked) { showError('fError', 'modalOverlay', 'Примите публичную оферту'); return; }

  const quest   = document.getElementById('modalQuestName').textContent;
  const city    = document.getElementById('modalOverlay').dataset.city || 'astana';
  const cityName = city === 'aktobe' ? 'Актобе' : 'Астане';
  const name    = document.getElementById('fName').value.trim();
  const phone   = document.getElementById('fPhone').value.trim();
  const date    = document.getElementById('fDate').value;
  const time    = document.getElementById('fTime').value;
  const players = parseInt(document.getElementById('fPlayers').value);
  const comment = document.getElementById('fComment').value.trim();
  const price   = calcPrice(players, time, quest, city);

  let msg = `*Здравствуйте, хочу забронировать ЭПИЧНУЮ ИГРУ в ${cityName}!*\n\n`;
  msg += `Квест: *${quest}*\n`;
  msg += `Имя: ${name}\nТелефон: ${phone}\n`;
  msg += `Дата: ${formatDate(date)}\nВремя: ${time}\nИгроков: ${players}\n`;
  msg += `Стоимость: ${fmt(price)} тг\n`;
  if (comment) msg += `Комментарий: ${comment}\n`;
  msg += `\nС офертой ознакомлен(-а).`;

  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  setTimeout(() => closeModal(), 500);
}

function sendPackageWhatsApp() {
  const err = validateFields(PKG_FIELDS);
  if (err) { showError('pkgError', 'modalPackageOverlay', err); return; }

  const agree = document.getElementById('pAgreeCheck');
  if (agree && !agree.checked) { showError('pkgError', 'modalPackageOverlay', 'Примите публичную оферту'); return; }

  const pkg     = document.getElementById('modalPackageName').textContent;
  const city    = document.getElementById('modalPackageOverlay').dataset.city || 'astana';
  const cityName = city === 'aktobe' ? 'Актобе' : 'Астане';
  const name    = document.getElementById('pName').value.trim();
  const phone   = document.getElementById('pPhone').value.trim();
  const date    = document.getElementById('pDate').value;
  const time    = document.getElementById('pTime').value;
  const guests  = document.getElementById('pGuests').value;
  const bday    = document.getElementById('pBirthday').value;
  const comment = document.getElementById('pComment').value.trim();

  let msg = `*Здравствуйте, хочу забронировать пакет в ${cityName}!*\n\n`;
  msg += `${pkg}\n`;
  msg += `Имя: ${name}\nТелефон: ${phone}\n`;
  msg += `Дата: ${formatDate(date)}\nВремя: ${time}\nГостей: ${guests}\n`;
  if (bday) msg += `День рождения: ${formatDate(bday, true)}\n`;
  if (comment) msg += `Комментарий: ${comment}\n`;
  msg += `\nС офертой ознакомлен(-а).`;

  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  setTimeout(() => closePackageModal(), 500);
}

function formatDate(dateStr, shortMonth = false) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long',
    ...(shortMonth ? {} : { year: 'numeric' })
  });
}

function showError(elId, overlayId, msg) {
  const overlay = document.getElementById(overlayId);
  let el = document.getElementById(elId);
  if (!el) {
    el = document.createElement('div');
    el.id = elId;
    el.style.cssText = 'background:#3a0000;color:#ff9999;padding:10px 14px;font-size:.8rem;margin-bottom:12px;border-left:3px solid #cc1111;';
    overlay.querySelector('.btn-whatsapp')?.before(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 4000);
}

// ── СТРАНИЦА КВЕСТА ────────────────────────────────────
function renderQuestPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  const q = QUESTS.find(x => x.id === id);
  if (!q) { location.href = 'index.html'; return; }

  if (q.city !== getCurrentCity()) {
    localStorage.setItem('epic_city', q.city);
  }

  document.title = `${q.name} — Epic Quest`;
  const container = document.getElementById('questPage');
  if (!container) return;

  const levels = q.levels.map((l, i) => `
    <div class="level-item">
      <div class="level-num">${i + 1}</div>
      <div class="level-info"><strong>${l.name}</strong><p>${l.desc}</p></div>
    </div>`).join('');
  const rules = q.rules.map(r => `<li>${r}</li>`).join('');

  let sidebarPricesHTML = '';
  if (q.id === 'emotions') {
    sidebarPricesHTML = `
      <div class="sp-row"><span>2 человека</span><strong>25 000 ₸</strong></div>
      <div class="sp-row"><span>4 человека</span><strong>35 000 ₸</strong></div>`;
  } else if (q.city === 'aktobe') {
    const maxP = QUEST_PLAYER_LIMITS[q.id] ?? q.maxPlayers ?? 15;
    sidebarPricesHTML = `
      <div class="sp-row"><span>2 человека</span><strong>8 000 ₸</strong></div>
      <div class="sp-row"><span>3 человека</span><strong>9 000 ₸</strong></div>
      <div class="sp-row"><span>4 человека</span><strong>12 000 ₸</strong></div>
      <div class="sp-row"><span>5–${maxP} человек</span><strong>2 500 ₸/чел</strong></div>
      <div class="sp-row sp-note"><span>После 20:00 (2–3 чел.)</span><strong>+3 000 ₸</strong></div>`;
  } else {
    const maxP = QUEST_PLAYER_LIMITS[q.id] ?? q.maxPlayers ?? 20;
    sidebarPricesHTML = `
      <div class="sp-row"><span>2 человека</span><strong>14 000 ₸</strong></div>
      <div class="sp-row"><span>3 человека</span><strong>15 000 ₸</strong></div>
      <div class="sp-row"><span>4 человека</span><strong>18 000 ₸</strong></div>
      <div class="sp-row"><span>5–${maxP} человек</span><strong>4 000 ₸/чел</strong></div>
      <div class="sp-row sp-note"><span>После 21:00 (2–3 чел.)</span><strong>+4 000 ₸</strong></div>`;
  }

  container.innerHTML = `
    <div class="qpage-hero" style="background-image:url('${q.img}')">
      <div class="qpage-hero-overlay"></div>
      <div class="qpage-hero-content">
        <span class="qpage-tag" style="background:${q.tagColor}">${q.tag}</span>
        <h1 class="qpage-title">${q.name}</h1>
        <p class="qpage-genre">${q.genre} · ${q.city === 'aktobe' ? 'Актобе' : 'Астана'}</p>
        <div class="qpage-hero-btns">
          <button class="btn-hero-book" onclick="openModal('${q.name}')">Забронировать</button>
          <a href="${q.map2gis}" target="_blank" rel="noopener" class="btn-hero-map">📍 Смотреть на 2ГИС</a>
        </div>
      </div>
    </div>
    <div class="qpage-body">
      <div class="qpage-main">
        <section class="qpage-section"><h2>О квесте</h2><div class="qpage-desc">${q.fullDesc}</div></section>
        <section class="qpage-section"><h2>Уровни квеста</h2><div class="levels-list">${levels}</div></section>
        <section class="qpage-section">
          <h2>Адрес</h2>
          <div class="qpage-address">
            <p>📍 ${q.address}</p>
            <a href="${q.map2gis}" target="_blank" rel="noopener" class="btn-2gis">Открыть в 2ГИС →</a>
          </div>
        </section>
      </div>
      <aside class="qpage-sidebar">
        <div class="sidebar-box"><h3>Правила допуска</h3><ul class="rules-list">${rules}</ul></div>
        <div class="sidebar-box sidebar-price">
          <h3>Стоимость</h3>
          <div class="sidebar-prices">${sidebarPricesHTML}</div>
          <button class="btn-sidebar-book" onclick="openModal('${q.name}')">Забронировать</button>
        </div>
      </aside>
    </div>`;
}

function initBurger() {
  const burger = document.getElementById('burgerBtn');
  const navMobile = document.getElementById('navMobile');
  if (!burger || !navMobile) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('is-open');
    navMobile.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      navMobile.classList.remove('is-open');
      burger.setAttribute('aria-expanded', false);
    });
  });
}

function initCityToggle() {
  document.querySelectorAll('.city-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const city = btn.dataset.city;
      setCurrentCity(city);
    });
  });

  const current = getCurrentCity();
  updateCityToggleUI(current);
  applyCityToUI(current);
}

document.addEventListener('DOMContentLoaded', () => {
  initCityToggle();

  if (document.getElementById('questsGrid')) {
    renderQuestCards();
    renderPackagesForCity(getCurrentCity());
    updateContactsForCity(getCurrentCity());
  }
  if (document.getElementById('questPage')) renderQuestPage();
  initBurger();

  ['modalOverlay', 'modalPackageOverlay'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
      if (e.target.id === id) {
        id === 'modalOverlay' ? closeModal() : closePackageModal();
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('modalOverlay')?.classList.contains('active')) closeModal();
    if (document.getElementById('modalPackageOverlay')?.classList.contains('active')) closePackageModal();
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'fTime' || e.target.id === 'fPlayers') updatePrice();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const confirmed = confirm('Хочу сыграть 😈\n\nПерейти в WhatsApp?');
      if (confirmed) {
        window.open(this.href, '_blank', 'noopener,noreferrer');
      }
    });
  });
});
