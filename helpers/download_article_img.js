const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');
const path = require('path')
const strapiPath = 'http://' + process.env['StrapiHost'];
const savePath = path.join(__dirname, '..', 'assets', 'img', 'img_articles')

const languages = ['en', 'et', 'ru']
for (const lang of languages) {
    var articleData = ''
    try {
        const articleDataFile = path.join('source', '_fetchdir', `articles.${lang}.yaml`)
        articleData = yaml.safeLoad(fs.readFileSync(articleDataFile, 'utf8'))
    } catch (e) {
        console.log(e)
    }

    for (values of articleData) {
        if (!values.slug) {
            continue
        }

        const imgDir = path.join(savePath, lang, values.slug)
        fs.mkdirSync( path.join(savePath, lang, values.slug), {recursive: true} )

        if (values.media && values.media.imageDefault) {
            const imgPath = values.media.imageDefault[0].url
            const imgFileName = path.basename(imgPath)
            const url = path.join(strapiPath, imgPath)
            const dest = path.join(imgDir, imgFileName)
            download(url, dest)
        }
        if (values.media && values.media.image && values.media.image[0]) {
            const imgPath = values.media.image[0].url
            const imgFileName = path.basename(imgPath)
            const url = path.join(strapiPath, imgPath)
            const dest = path.join(imgDir, imgFileName)
            download(url, dest)
        }

    }
}

function download(url, dest) {
    let fileSizeInBytes = 0
    if (fs.existsSync(dest)) {
        const stats = fs.statSync(dest);
        fileSizeInBytes = stats.size;
    }

    http.get(url, function (response) {
        if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
            // console.log(typeof(response.headers["content-length"]));
            var file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', function () {
                file.close();  // close() is async, call cb after close completes.
                console.log(`Downloaded: Article img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest} - ${response.headers["content-length"]} bytes`);
            });
        }else{
            // console.log(`Skipped: Article img ${url.split('/')[url.split('/').length - 1]} due to same exists`);
        }
    }).on('error', function (err) { // Handle errors
        console.log(err);
        // fs.unlink(dest); // Delete the file async. (But we don't check the result)
    })
};
