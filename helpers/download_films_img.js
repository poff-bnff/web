const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const {parallelLimit} = require('async')
const fetch = require('node-fetch')


const strapiPath = 'http://' + process.env['StrapiHost']
const savePath = path.join(__dirname, '..', 'assets', 'img', 'dynamic', 'img_films')

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

process.stdout.write('Film pics ')
let parallelDownloads = []

var filmData = ''
try {
    const filmDataFile = path.join('source', '_fetchdir', `films.en.yaml`)
    filmData = yaml.safeLoad(fs.readFileSync(filmDataFile, 'utf8'))
} catch (e) {
    console.log(e)
}

for (values of filmData) {
    if (!values.slug) {
        continue
    }

    const imgDir = path.join(savePath, values.slug)
    fs.mkdirSync( path.join(savePath, values.slug), {recursive: true} )

    if (values.media && values.media.stills && values.media.stills[0]) {
        for (stillIx in values.media.stills) {
            // console.log(values.media.stills[stillIx]);
            const imgPath = values.media.stills[stillIx].url
            const imgFileName = path.basename(imgPath)
            const url = `${strapiPath}${imgPath}`
            const dest = path.join(imgDir, imgFileName)
            parallelDownloads.push( downloadsMaker(url, dest) )
        }
    }

    if (values.media && values.media.posters && values.media.posters[0]) {
        for (posterIx in values.media.posters) {
            // console.log(values.media.stills[posterIx]);
            const imgPath = values.media.posters[posterIx].url
            const imgFileName = path.basename(imgPath)
            const url = `${strapiPath}${imgPath}`
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
        console.log(' ' + results.length + ' files downloaded.')
    }
)

// function download(url, dest, parallelCB, retrys=5) {
//     let fileSizeInBytes = 0
//     if (fs.existsSync(dest)) {
//         const stats = fs.statSync(dest);
//         fileSizeInBytes = stats.size;
//     }
//     try {

//     } catch (error) {

//     }
//     http.get(url, function (response) {
//         const { statusCode } = response
//         if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
//             // console.log(typeof(response.headers["content-length"]));
//             let file = fs.createWriteStream(dest);
//             response.pipe(file);
//             file.on('finish', function () {
//                 file.close(() => {
//                     // console.log('Try', retrys, `Downloaded: Article img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest} - ${response.headers["content-length"]} bytes`)
//                     setTimeout(() => {
//                         parallelCB(null, 'downloaded ' + url)
//                     }, 500)
//                 })
//             })
//         }else{
//             // console.log('Try', retrys, `Skipped: Article img ${url.split('/')[url.split('/').length - 1]} due to same exists`)
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
