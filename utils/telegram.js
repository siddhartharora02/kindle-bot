const telegramToken = process.env.TELEGRAM_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

const axios = require("axios");

const sendTelegramMessage = async (message) => {
    try {
        const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

        const payload = {
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'HTML'
        };

        await axios.post(url, payload);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    sendTelegramMessage
}

