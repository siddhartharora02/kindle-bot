const axios = require('axios');
const fs = require('fs');

function extractDocId(url) {
    const match = url.match(/\/d\/(.+?)(\/|$)/);
    return match ? match[1] : null;
}

async function downloadDocx(docId) {
    const docxUrl = `https://docs.google.com/document/d/${docId}/export?format=docx`;

    try {
        const response = await axios({
            method: 'get',
            url: docxUrl,
            responseType: 'stream'
        });

        // name of the file should be the title of the google doc
        const title = response.headers['content-disposition'].match(/filename="(.+)"/)[1];
        const writer = fs.createWriteStream(`./public/${title}`);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // return the filename, filepath to the downloaded file
        return {
            filename: title,
            filepath: `./public/${title}`
        };
    } catch (error) {
        console.error('Failed to download the DOCX file:', error);
    }
}

const extractDocument = async (googleDocsUrl) => {

    const docId = extractDocId(googleDocsUrl);

    if (docId) {
        return await downloadDocx(docId);
    } else {
        console.log('Invalid Google Docs URL');
    }
}


const isGoogleDoc = (url) => {
    return url.includes('docs.google.com');
}

module.exports = {
    isGoogleDoc,
    extractDocument
};