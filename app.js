require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const fetchAndCleanArticle = require('./src/fetchAndCleanArticle');
const convertToEpub = require('./src/convertToEpub');
const { sendMail } = require('./utils/sendMail');
const { isGoogleDoc, extractDocument } = require('./utils/googleDocs');
const slugify = require("slugify");
const {rename} = require("fs");
const {join} = require("path");

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Telegram bot token
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Nodemailer setup (replace with your SMTP details)

// Function to extract text from URL
async function getArticleContent(url) {
    try {
        const {
            cleanedContent: article,
            title,
            author,
        } = await fetchAndCleanArticle(url);

        if (!article) {
            return null;
        }

        const path = await convertToEpub(article, title, author);

        return {
            title,
            path,
        };

    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}


// Telegram bot command listener, triggered when user sends a message
bot.on('message', async (msg) => {
    console.log('Message received:', msg);
    const chatId = msg.chat.id;
    const url = msg.text;

    try {
        if (msg.document) {
            // Handle document files
            const fileId = msg.document.file_id;
            const safeName = slugify(msg.document.file_name, {
                lower: true,      // Convert to lower case
            });
            const downloadDir = './public';
            const downloadPath = join(downloadDir, safeName);

            // Download the document
            bot.downloadFile(fileId, downloadDir).then(
                filePath => {
                    // Rename the downloaded file to its safe name
                    const tempPath = filePath;
                    rename(tempPath, downloadPath, (err) => {
                        if (err) {
                            console.error('Error renaming the downloaded file:', err);
                            return;
                        }
                        console.log(`File downloaded and saved as ${downloadPath}`);
                    });
                    sendMail(safeName, downloadPath, 'file');
                },
                error => console.error('Error downloading file:', error)
            );
        } else if (isGoogleDoc(url)) {
            const {
                filename,
                filepath
            } = await extractDocument(url);

            await sendMail(filename, filepath, 'docx');
        }
        else if (/http(s)?:\/\/[^\s]+/.test(url)) {
            // Call your URL to EPUB conversion function
            const {
                title: filename,
                path: filepath,
            } = await getArticleContent(url);

            await sendMail(filename, filepath);
        } else {
            await bot.sendMessage(chatId, "Please send a valid URL.");
        }
    } catch (error) {
        console.error('Error processing message:', error);
        // Send an error message to the user
        await bot.sendMessage(chatId, "An error occurred. Please try again later.");
    }
});

console.log('Bot server is running...');