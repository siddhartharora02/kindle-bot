const nodemailer = require('nodemailer');
const fs = require("fs");

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL, // Your Gmail address
        pass: process.env.APP_PASSWORD    // Your App Password
    }
});

let mailOptions = (filename, filepath, type='epub') => {
    const attachments = [];
    switch (type) {
        case 'epub':
            attachments.push({
                filename: `${filename}.epub`,
                path: filepath
            });
            break;
        case 'docx':
            attachments.push({
                filename: `${filename}.docx`,
                path: filepath
            });
            break;
        case 'file':
            attachments.push({
                filename: filename,
                path: filepath
            });
            break;
        default:
            break;
    }

    return {
        from: `"${process.env.APP_NAME}" <${process.env.APP_EMAIL}>`,  // Your email address
        to: process.env.APP_KINDLE_EMAIL,                 // Recipient's email address
        subject: 'Kindle Document',          // Subject line
        text: 'New Kindle Document',// Plain text body
        attachments: attachments
    }
};

const sendMail = (filename, filepath, type) => transporter.sendMail(
    mailOptions(filename, filepath, type), (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);

        // Delete the file after sending the email

        emptyPublicFolder();
    });

const emptyPublicFolder = () => {
    fs.readdir('./public', (err, files) => {
        if (err) {
            console.error(err);
        }

        for (const file of files) {
            fs.unlink(`./public/${file}`, err => {
                if (err) {
                    console.error(err);
                }
            });
        }
    });
}
module.exports = {
    sendMail
};