const Epub = require("epub-gen");
const slugify = require('slugify');

module.exports = async function (content, title, author) {
    // Convert the cleaned HTML to an EPUB
    const option = {
        title: title,
        author: author,
        content: [{
            data: content,
            title: title,
        }],
    };

    // move the generated EPUB to root directory
    // slugify the title to use as the filename
    const slug = slugify(title, { lower: true });
    const path = `./public/${slug}.epub`;
    await new Epub(option, path);

    return path;
}