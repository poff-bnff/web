const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');
const path = require('path')
const {parallelLimit} = require('async')

const strapiPath = 'http://' + process.env['StrapiHost'];
const savePath = path.join(__dirname, '..', 'assets', 'img', 'dynamic', 'img_articles')

const languages = ['en', 'et', 'ru']

function downloadsMaker(url, dest) {
    return function(parallelCB) {
        download(url, dest, parallelCB)
    }
}

let parallelDownloads = []
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
            parallelDownloads.push( downloadsMaker(url, dest) )
        }

        if (values.media && values.media.image && values.media.image[0]) {
            const imgPath = values.media.image[0].url
            const imgFileName = path.basename(imgPath)
            const url = path.join(strapiPath, imgPath)
            const dest = path.join(imgDir, imgFileName)
            parallelDownloads.push( downloadsMaker(url, dest) )
        }
    }
}
parallelLimit(
    parallelDownloads,
    10,
    function(err, results) {
        if (err) {
            console.log(err)
        }
        console.log(results)
    }
)

function download(url, dest, parallelCB, retrys=5) {
    let fileSizeInBytes = 0
    if (fs.existsSync(dest)) {
        const stats = fs.statSync(dest);
        fileSizeInBytes = stats.size;
    }
    try {

    } catch (error) {

    }
    http.get(url, function (response) {
        const { statusCode } = response
        if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
            // console.log(typeof(response.headers["content-length"]));
            let file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', function () {
                file.close(() => {
                    // console.log('Try', retrys, `Downloaded: Article img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest} - ${response.headers["content-length"]} bytes`)
                    setTimeout(() => {
                        parallelCB(null, 'downloaded ' + url)
                    }, 500)
                })
            })
        }else{
            // console.log('Try', retrys, `Skipped: Article img ${url.split('/')[url.split('/').length - 1]} due to same exists`)
            setTimeout(() => {
                parallelCB(null, 'skipped ' + url)
            }, 500)
        }
    }).on('error', function (err) {
        console.log('ERROR', url, err)
        if (retrys > 0) {
            download(url, dest, parallelCB, retrys-1)
        }
        parallelCB(err)
    })
}
