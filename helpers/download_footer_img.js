const http = require('http');
const fs = require('fs');
const yaml = require('js-yaml');

const {parallelLimit} = require('async')

var strapiPath = 'http://' + process.env['StrapiHost']
var savePath = 'assets/img/dynamic/img_footer/'

loadYaml(readYaml);

function loadYaml(readYaml) {
    var doc = '';
    try {
        doc = yaml.safeLoad(fs.readFileSync(`source/global.et.yaml`, 'utf8'))

    } catch (e) {
        console.log(e);
    }
    fs.mkdir(`${savePath}`, err => {
        if (err) {
        }
    })
    readYaml(doc);
}

function downloadsMaker(url, dest) {
    return function(parallelCB) {
        download(url, dest, parallelCB)
    }
}

function readYaml(doc) {
    let parallelDownloads = []
    // console.log(doc.footer);
    if (doc.footer.logosSections) {
        for (const ix in doc.footer.logosSections) {
            const section = doc.footer.logosSections[ix]
            for (const i in section.logo) {
                const logo = section.logo[i]
                if ('imgWhite' in logo && 'url' in logo.imgWhite){
                    let imgPathW = logo.imgWhite.url;
                    let imgFileName = imgPathW.split('/')[imgPathW.split('/').length - 1]
                    let url = `${strapiPath}${imgPathW}`
                    let dest = `${savePath}${imgFileName}`
                    parallelDownloads.push( downloadsMaker(url, dest) )
                }

                if ('imgColor' in logo && 'url' in logo.imgColour){
                    let imgPathC = logo.imgColour.url;
                    let imgFileName = imgPathC.split('/')[imgPathC.split('/').length - 1]
                    let url = `${strapiPath}${imgPathC}`
                    let dest = `${savePath}${imgFileName}`
                    parallelDownloads.push( downloadsMaker(url, dest) )
                }

                if ('imgBlack' in logo && 'url' in logo.imgBlack){
                    let imgPathB = logo.imgBlack.url;
                    let imgFileName = imgPathB.split('/')[imgPathB.split('/').length - 1]
                    let url = `${strapiPath}${imgPathB}`
                    let dest = `${savePath}${imgFileName}`
                    parallelDownloads.push( downloadsMaker(url, dest) )
                }
            }
        }
    }
    if (doc.footer.socialGroup) {
        for (const ix in doc.footer.socialGroup) {
            const group = doc.footer.socialGroup[ix]
            for (const i in group.items) {
                const items = group.items[i]
                if ('svgMedia' in items && 'url' in items.svgMedia){
                    let imgPath = items.svgMedia.url;
                    let imgFileName = imgPath.split('/')[imgPath.split('/').length - 1]
                    let url = `${strapiPath}${imgPath}`
                    let dest = `${savePath}${imgFileName}`
                    parallelDownloads.push( downloadsMaker(url, dest) )
                }
            }
        }
    }
    if (doc.footer.item) {
        for (const ix in doc.footer.item) {
            const item = doc.footer.item[ix]
            if ('image' in item && 'url' in item.image) {
                // console.log(item.image);
                let imgPath = item.image.url;
                let imgFileName = imgPath.split('/')[imgPath.split('/').length - 1]
                let url = `${strapiPath}${imgPath}`
                let dest = `${savePath}${imgFileName}`
                parallelDownloads.push( downloadsMaker(url, dest) )
            }
        }

        for (const ix in doc.footer.item) {
            const item = doc.footer.item[ix]
            for (const i in item.svgItem) {
                const media = item.svgItem[i]
                if('svgMedia' in media &&'url' in media.svgMedia) {
                    // console.log(media.svgMedia.url);
                    let imgPath = media.svgMedia.url;
                    let imgFileName = imgPath.split('/')[imgPath.split('/').length - 1]
                    let url = `${strapiPath}${imgPath}`
                    let dest = `${savePath}${imgFileName}`
                    parallelDownloads.push( downloadsMaker(url, dest) )
                }
            }
        }
    }
    // console.log(parallelDownloads);
    parallelLimit(
        parallelDownloads,
        5,
        function(err, results) {
            if (err) {
                console.log(err)
            }
            console.log(results)
        }
    )
}


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
        console.log('Status', statusCode, url)
        if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
            let file = fs.createWriteStream(dest)
            response.pipe(file)
            file.on('finish', function () {
                file.close(() => {
                    // console.log('Try', retrys, `Downloaded: Footer img ${url.split('/')[url.split('/').length - 1]} to ${dest}`)
                    setTimeout(() => {
                        parallelCB(null, 'downloaded ' + url)
                    }, 500)
                })
            })
        }else{
            // console.log(`Skipped: Footer img ${url.split('/')[url.split('/').length - 1]} skipped due to same exists`)
            // console.log('Try', retrys, `Skipped: Footer img ${url.split('/')[url.split('/').length - 1]} due to same exists`)
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

