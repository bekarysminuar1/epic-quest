// ═══════════════════════════════════════════════════════
//  main.js — Epic Quest Astana  (ОБНОВЛЁННАЯ ВЕРСИЯ)
// ═══════════════════════════════════════════════════════

// ── КОНСТАНТЫ ──────────────────────────────────────────
const WA_NUMBER = '77782836670';
const PRICE_MAP = { 2: 14000, 3: 15000, 4: 18000 };
const LATE_HOUR = 21;

// Лимиты игроков по квестам (id → maxPlayers)
const QUEST_PLAYER_LIMITS = {
  'traditions':  7,   // МТ
  'astral':      10,  // Астрал
  'saw':         10,  // Пила
  'poltergeist': 15,  // Полтер
  'granny':      10,  // Гренни
  'stranger':    15,  // ОСД 2
  'squid':       10,  // Игра в кальмара
};

// ── НАВИГАЦИЯ ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('solid', window.scrollY > 50);
}, { passive: true });

// Кнопка «наверх»
window.addEventListener('scroll', () => {
  document.getElementById('btnTop')?.classList.toggle('is-visible', window.scrollY > 400);
}, { passive: true });

// ── УТИЛИТЫ ────────────────────────────────────────────
function calcPrice(players, timeStr, questName = '') {
  if (!players || players < 2) return 0;
  if (questName === 'Дом Эмоций: Комната Любви и Примирения') {
    if (players === 2) return 25000;
    if (players === 4) return 35000;
    return 0;
  }
  const base = PRICE_MAP[players] ?? players * 4000;
  const late = (players <= 3) && isLateTime(timeStr) ? 4000 : 0;
  return base + late;
}

function isLateTime(timeStr) {
  if (!timeStr) return false;
  const [h] = timeStr.split(':').map(Number);
  return h >= LATE_HOUR || h < 4;
}

function fmt(n) {
  return n.toLocaleString('ru-RU');
}

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

// ── РЕНДЕР КАРТОЧЕК НА ГЛАВНОЙ ─────────────────────────
function renderQuestCards() {
  const grid = document.getElementById('questsGrid');
  if (!grid) return;

  grid.innerHTML = QUESTS.map(q => {
    const minPrice = q.id === 'emotions' ? '25 000' : '14 000';
    // Разделяем иконки игроков и возраста (исправление путаницы)
    return `
    <article class="quest-card" role="listitem" onclick="location.href='quest.html?id=${q.id}'" aria-label="${q.name}">
      <div class="qcard-img">
        <img src="${q.img}" alt="${q.name}" loading="lazy" onerror="this.parentElement.style.background='#1a0505'">
        <div class="qcard-overlay" aria-hidden="true"></div>
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
          <button class="btn-card-book" onclick="event.stopPropagation(); openModal('${q.name}')" aria-label="Забронировать ${q.name}">
            Забронировать
          </button>
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

// ── МОДАЛКА КВЕСТА ──────────────────────────────────────
function openModal(questName) {
  const q = QUESTS.find(x => x.name === questName);
  if (!q) return;

  // Дом Эмоций — открываем отдельную страницу
  if (q.id === 'emotions') {
    window.location.href = 'emotions-booking.html';
    return;
  }

  document.getElementById('modalQuestName').textContent = questName;

  const playersSelect = document.getElementById('fPlayers');
  const overlay = document.getElementById('modalOverlay');
  const priceRowsContainer = overlay ? overlay.querySelector('.price-rows') : null;

  // Лимит игроков для конкретного квеста
  const maxP = QUEST_PLAYER_LIMITS[q.id] ?? q.maxPlayers ?? 20;

  playersSelect.innerHTML = '<option value="">Выберите</option>';
  for (let i = 2; i <= maxP; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${i} ${playersLabel(i)}`;
    playersSelect.appendChild(opt);
  }

  if (priceRowsContainer) {
    priceRowsContainer.innerHTML = `
      <div class="price-row"><span>2 человека</span><span class="price-val">14 000 ₸</span></div>
      <div class="price-row"><span>3 человека</span><span class="price-val">15 000 ₸</span></div>
      <div class="price-row"><span>4 человека</span><span class="price-val">18 000 ₸</span></div>
      <div class="price-row"><span>5–${maxP} человек</span><span class="price-val">4 000 ₸/чел</span></div>
      <div class="price-row price-row-note"><span>⏰ После 21:00 (2–3 чел.)</span><span class="price-val">+4 000 ₸</span></div>
    `;
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

  // Показываем подсказку для именинников
  const bdayNote = document.getElementById('birthdayNote');
  if (bdayNote) bdayNote.style.display = 'block';

  openOverlay('modalOverlay');
}

function closeModal() {
  closeOverlay('modalOverlay');
}

// ── МОДАЛКА ПАКЕТОВ ─────────────────────────────────────
const PACKAGES = {
  'ПОЛТЕР':  { price_week: 89000,  price_weekend: 110000, max: 15 },
  'ПИЛА':    { price_week: 56000,  price_weekend: 70000,  max: 10 },
  'МТ':      { price_week: 56000,  price_weekend: 70000,  max: 7  },
  'ПРАЙМ':   { price_week: 99000,  price_weekend: 120000, max: 10 },
  'ЛЕГЕНДА': { price_week: 130000, price_weekend: 180000, max: 15 }
};

function openPackageModal(pkgName) {
  const pkg = PACKAGES[pkgName];
  if (!pkg) return;

  document.getElementById('modalPackageName').textContent = 'Пакет: ' + pkgName;
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

  openOverlay('modalPackageOverlay');
}

function closePackageModal() {
  closeOverlay('modalPackageOverlay');
}

// ── ОБЩИЕ ХЕЛПЕРЫ ДЛЯ МОДАЛОК ──────────────────────────
function openOverlay(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// ── ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ──────────────────────────────
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

// ── РАСЧЁТ ЦЕНЫ ──────────────────────────────────────────
function updatePrice() {
  const questName = document.getElementById('modalQuestName').textContent;
  const players = parseInt(document.getElementById('fPlayers').value) || 0;
  const time = document.getElementById('fTime')?.value || '';
  const calc = document.getElementById('priceCalc');
  if (!calc) return;

  if (!players) {
    calc.textContent = 'Выберите количество игроков';
    calc.className = 'price-calc';
    return;
  }

  const total = calcPrice(players, time, questName);
  const isEmotions = questName === 'Дом Эмоций: Комната Любви и Примирения';
  const extra = (!isEmotions && isLateTime(time) && players <= 3) ? 4000 : 0;

  calc.textContent = `💰 Итого: ${fmt(total)} ₸${extra ? ` (+4 000 ₸ после ${LATE_HOUR}:00)` : ''}`;
  calc.className = 'price-calc price-calc-active';
}

// ── ВАЛИДАЦИЯ ───────────────────────────────────────────
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

// ── ОТПРАВКА В WHATSAPP — КВЕСТ ─────────────────────────
function sendWhatsApp() {
  const err = validateFields(QUEST_FIELDS);
  if (err) { showError('fError', 'modalOverlay', err); return; }

  const agree = document.getElementById('agreeCheck');
  if (agree && !agree.checked) { showError('fError', 'modalOverlay', 'Примите публичную оферту'); return; }

  const quest   = document.getElementById('modalQuestName').textContent;
  const name    = document.getElementById('fName').value.trim();
  const phone   = document.getElementById('fPhone').value.trim();
  const date    = document.getElementById('fDate').value;
  const time    = document.getElementById('fTime').value;
  const players = parseInt(document.getElementById('fPlayers').value);
  const comment = document.getElementById('fComment').value.trim();
  const price   = calcPrice(players, time, quest);
  const dateStr = formatDate(date);

  let msg = `*Здравствуйте, хочу забронировать квест*\n\n`;
  msg += `Квест: *${quest}*\n`;
  msg += `Имя: ${name}\nТелефон: ${phone}\n`;
  msg += `Дата: ${dateStr}\nВремя: ${time}\nИгроков: ${players}\n`;
  msg += `Стоимость: ${fmt(price)} тг\n`;
  if (comment) msg += `Комментарий: ${comment}\n`;
  msg += `\nС офертой ознакомлен(-а).`;

  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  setTimeout(() => closeModal(), 500);
}

// ── ОТПРАВКА В WHATSAPP — ПАКЕТ ─────────────────────────
function sendPackageWhatsApp() {
  const err = validateFields(PKG_FIELDS);
  if (err) { showError('pkgError', 'modalPackageOverlay', err); return; }

  const agree = document.getElementById('pAgreeCheck');
  if (agree && !agree.checked) { showError('pkgError', 'modalPackageOverlay', 'Примите публичную оферту'); return; }

  const pkg     = document.getElementById('modalPackageName').textContent;
  const name    = document.getElementById('pName').value.trim();
  const phone   = document.getElementById('pPhone').value.trim();
  const date    = document.getElementById('pDate').value;
  const time    = document.getElementById('pTime').value;
  const guests  = document.getElementById('pGuests').value;
  const bday    = document.getElementById('pBirthday').value;
  const comment = document.getElementById('pComment').value.trim();

  let msg = `*Здравствуйте, хочу забронировать пакет*\n\n`;
  msg += `${pkg}\n`;
  msg += `Имя: ${name}\nТелефон: ${phone}\n`;
  msg += `Дата: ${formatDate(date)}\nВремя: ${time}\nГостей: ${guests}\n`;
  if (bday) msg += `День рождения: ${formatDate(bday, true)}\n`;
  if (comment) msg += `Комментарий: ${comment}\n`;
  msg += `\nС офертой ознакомлен(-а).`;

  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  setTimeout(() => closePackageModal(), 500);
}

// ── ХЕЛПЕРЫ ─────────────────────────────────────────────
function formatDate(dateStr, shortMonth = false) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
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

// ── СТРАНИЦА КВЕСТА ──────────────────────────────────────
function renderQuestPage() {
  const id = new URLSearchParams(window.location.search).get('id');
  const q = QUESTS.find(x => x.id === id);
  if (!q) { location.href = 'index.html'; return; }

  document.title = `${q.name} — Epic Quest Astana`;

  const container = document.getElementById('questPage');
  if (!container) return;

  const levels = q.levels.map((l, i) => `
    <div class="level-item">
      <div class="level-num" aria-hidden="true">${i + 1}</div>
      <div class="level-info">
        <strong>${l.name}</strong>
        <p>${l.desc}</p>
      </div>
    </div>`).join('');
  const rules = q.rules.map(r => `<li>${r}</li>`).join('');

  let sidebarPricesHTML = '';
  if (q.id === 'emotions') {
    sidebarPricesHTML = `
      <div class="sp-row"><span>2 человека</span><strong>25 000 ₸</strong></div>
      <div class="sp-row"><span>4 человека</span><strong>35 000 ₸</strong></div>
    `;
  } else {
    const maxP = QUEST_PLAYER_LIMITS[q.id] ?? q.maxPlayers ?? 20;
    sidebarPricesHTML = `
      <div class="sp-row"><span>2 человека</span><strong>14 000 ₸</strong></div>
      <div class="sp-row"><span>3 человека</span><strong>15 000 ₸</strong></div>
      <div class="sp-row"><span>4 человека</span><strong>18 000 ₸</strong></div>
      <div class="sp-row"><span>5–${maxP} человек</span><strong>4 000 ₸/чел</strong></div>
      <div class="sp-row sp-note"><span>После ${LATE_HOUR}:00 (2–3 чел.)</span><strong>+4 000 ₸</strong></div>
    `;
  }

  // Мета на странице квеста — разделяем иконки
  const metaPlayers = q.id === 'emotions' ? '2 или 4 игрока' : `${q.players} игроков`;
  const durationLabel = q.id === 'emotions' ? '90 минут' : `${q.duration} минут`;

  container.innerHTML = `
    <div class="qpage-hero" style="background-image:url('${q.img}')" role="img" aria-label="${q.name}">
      <div class="qpage-hero-overlay" aria-hidden="true"></div>
      <div class="qpage-hero-content">
        <span class="qpage-tag" style="background:${q.tagColor}">${q.tag}</span>
        <h1 class="qpage-title">${q.name}</h1>
        <p class="qpage-genre">${q.genre}</p>
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

// ── БУРГЕР-МЕНЮ ─────────────────────────────────────────
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

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('questsGrid')) renderQuestCards();
  if (document.getElementById('questPage'))  renderQuestPage();
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

  // Счётчик просмотров — кликабельность
  document.querySelectorAll('.view-counter').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const count = parseInt(el.dataset.count || '0') + 1;
      el.dataset.count = count;
      el.textContent = `👁 ${count}`;
    });
  });
});

// ── WHATSAPP С ПОДТВЕРЖДЕНИЕМ ────────────────────────────
// Перехватываем все ссылки на WhatsApp (плавающая кнопка, футер, соцсети)
document.addEventListener('DOMContentLoaded', () => {
  // Находим все WA-ссылки, кроме кнопок отправки формы (у них свой обработчик)
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