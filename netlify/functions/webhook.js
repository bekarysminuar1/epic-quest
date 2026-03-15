// netlify/functions/webhook.js
// Принимает команды от Telegram бота (/stats и др.)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const TG_TOKEN   = process.env.TG_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  try {
    const body = JSON.parse(event.body);
    const message = body.message;
    if (!message) return { statusCode: 200, body: 'ok' };

    const chatId = message.chat.id.toString();
    const text   = message.text || '';

    // Только владелец может получать статистику
    if (chatId !== TG_CHAT_ID) {
      await sendTelegram(TG_TOKEN, chatId, '⛔ Нет доступа');
      return { statusCode: 200, body: 'ok' };
    }

    // ── КОМАНДА /start ──────────────────────────────
    if (text === '/start') {
      await sendTelegram(TG_TOKEN, chatId,
        `👋 *Привет! Я бот Epic Quest*\n\nДоступные команды:\n/stats — статистика заявок\n/help — помощь`
      );
      return { statusCode: 200, body: 'ok' };
    }

    // ── КОМАНДА /help ───────────────────────────────
    if (text === '/help') {
      await sendTelegram(TG_TOKEN, chatId,
        `📋 *Команды бота:*\n\n/stats — полная статистика\n/start — приветствие`
      );
      return { statusCode: 200, body: 'ok' };
    }

    // ── КОМАНДА /stats ──────────────────────────────
    if (text === '/stats') {
      // Статистика хранится на сайте в localStorage
      // Бот отвечает что нужно открыть сайт для отправки
      await sendTelegram(TG_TOKEN, chatId,
        `📊 Чтобы получить статистику — зайди на сайт epic\\-quest\\.kz и она автоматически придёт сюда`
      );
      return { statusCode: 200, body: 'ok' };
    }

    // Неизвестная команда
    await sendTelegram(TG_TOKEN, chatId,
      `Напиши /stats для статистики или /help для помощи`
    );

    return { statusCode: 200, body: 'ok' };

  } catch (err) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: 'error' };
  }
};

async function sendTelegram(token, chatId, text) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'MarkdownV2'
    })
  });
}