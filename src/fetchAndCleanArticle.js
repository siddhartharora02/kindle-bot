const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function (url) {
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio to manipulate HTML
    const $ = cheerio.load(html);

    // Example of cleaning: remove script tags
    $('script').remove();


    // title with .umatter_entryTitle__NSpLa, is with a tag and title attribute
    const title = $('a.umatter_entryTitle__NSpLa').text();
    const author = $('a.umatter_authorName__cmhQ5').text().trim();

    // Select the main content using the specific class
    const articleContent = $('.umatter_postSingleContent__hnB0Z');

    // Unwrap all elements except the specified tags
    articleContent.find('*').not('h1, h2, h3, h4, h5, h6, p, b, strong, i, em, br, blockquote, ul, ol, li, span, pre, code, img').each(function () {
        $(this).replaceWith($(this).html()); // Unwrap the element, keeping its content
    });

    // Get the cleaned HTML
    const cleanedContent = articleContent.html();

    // Check if content was found
    if (!cleanedContent) {
        console.log('No article content found.');
        return null;
    }

    return {
        title,
        author,
        cleanedContent
    };
}
