const fs = require('fs')
const yaml = require('js-yaml')
const {parallelLimit} = require('async')
const fetch = require('node-fetch')


const strapiPath = 'http://' + process.env['StrapiHost']
const savePath = 'assets/img/dynamic/img_trioblock/'

loadYaml('et', readYaml);
loadYaml('en', readYaml);

function loadYaml(lang, readYaml) {
    var doc = '';
    try {
        doc = yaml.safeLoad(fs.readFileSync(`source/_fetchdir/articletrioblock.${lang}.yaml`, 'utf8'));

    } catch (e) {
        console.log(e);
    }
    fs.mkdirSync(`${savePath}${lang}`, { recursive: true });
    readYaml(lang, doc);
}

const delay = (ms) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}
function retryFetch (url, fetchOptions={}, retries=3, retryDelay=1000) {
    return new Promise((resolve, reject) => {
        const wrapper = n => {
            fetch(url, fetchOptions)
                .then(res => { resolve(res) })
                .catch(async err => {
                    if(n > 0) {
                        console.log(`retrying ${n}`)
                        await delay(retryDelay)
                        wrapper(--n)
                    } else {
                        reject(err)
                    }
                })
        }

        wrapper(retries)
    })
}

function downloadsMaker(url, dest) {
    return function(parallelCB) {
        retryFetch(url)
        .then(res => {
            const callback = parallelCB
            const dest_stream = fs.createWriteStream(dest)
            res.body.pipe(dest_stream)
            process.stdout.write('.')
            callback(null, url)
        })
    }
}

function readYaml(lang, doc) {
    let parallelDownloads = []
    for (values of doc) {
        if (!values.article.slug) {
            continue;
        }else{
            fs.mkdir(`${savePath}${lang}/${values.article.slug}`, err => {
            });
        }

        if (values.block.image) {
            let imgPath = values.block.image.url
            let imgFileName = imgPath.split('/')[imgPath.split('/').length - 1]
            let url = `${strapiPath}${imgPath}`
            let dest = `${savePath}${lang}/${values.article.slug}/${imgFileName}`
            parallelDownloads.push( downloadsMaker(url, dest) )
        }
    }
    parallelLimit(
        parallelDownloads,
        10,
        function(err, results) {
            if (err) {
                console.log(err)
            }
            console.log(' ' + results.length + ' files downloaded.')
        }
    )
}



// function download(url, dest, parallelCB, retrys=5) {
//     let fileSizeInBytes = 0
//     if (fs.existsSync(dest)) {
//         const stats = fs.statSync(dest);
//         fileSizeInBytes = stats.size;
//     }

//     http.get(url, function (response) {
//         const { statusCode } = response
//         console.log('Status', statusCode, url)
//         if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
//             let file = fs.createWriteStream(dest);
//             response.pipe(file);
//             file.on('finish', function () {
//                 file.close(() => {
//                     // console.log('Try', retrys, `Downloaded: Trioblock img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest}`)
//                     setTimeout(() => {
//                         parallelCB(null, 'downloaded ' + url)
//                     }, 500)
//                 })
//             })
//         }else{
//             // console.log('Try', retrys, `Skipped: Trioblock img ${url.split('/')[url.split('/').length - 1]} due to same exists`)
//             setTimeout(() => {
//                 parallelCB(null, 'skipped ' + url)
//             }, 500)
//         }
//     }).on('error', function (err) {
//         console.log('ERROR', url, err)
//         if (retrys > 0) {
//             download(url, dest, parallelCB, retrys-1)
//         }
//         parallelCB(err)
//     })
// }

