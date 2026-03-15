// netlify/functions/notify.js
// Серверная функция — токен бота здесь, в браузер не попадает

exports.handler = async (event) => {
  // Разрешаем только POST запросы
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const TG_TOKEN   = process.env.TG_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  if (!TG_TOKEN || !TG_CHAT_ID) {
    return { statusCode: 500, body: 'Missing env variables' };
  }

  try {
    const body = JSON.parse(event.body);
    const { text, type, data } = body;

    // ── КОМАНДА /stats ───────────────────────────────
    if (type === 'stats') {
      const stats = data;

      const msg = `
📊 *Статистика Epic Quest*

🎮 *Заявок всего:* ${stats.totalBookings}
👥 *Игроков всего:* ${stats.totalPlayers}
💰 *Выручка:* ${formatNum(stats.totalRevenue)} тг

📈 *По квестам:*
${Object.entries(stats.quests)
  .sort((a, b) => b[1].count - a[1].count)
  .map(([name, d]) => `• ${name}: ${d.count} броней, ${formatNum(d.revenue)} тг`)
  .join('\n')}

📅 *Сегодня:* ${stats.today} заявок
📅 *За 7 дней:* ${stats.week} заявок
📅 *За 30 дней:* ${stats.month} заявок

🎂 *Пакеты ДР:* ${stats.packages} заявок
      `.trim();

      await sendTelegram(TG_TOKEN, TG_CHAT_ID, msg);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    // ── ОБЫЧНОЕ УВЕДОМЛЕНИЕ О ЗАЯВКЕ ─────────────────
    if (type === 'booking' && text) {
      await sendTelegram(TG_TOKEN, TG_CHAT_ID, text);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, body: 'Unknown request type' };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};

async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
  return res.json();
}

function formatNum(n) {
  return Number(n).toLocaleString('ru-RU');
}