const http = require('http')
const fs = require('fs')
const yaml = require('js-yaml')

const {parallelLimit} = require('async')
const { platform } = require('os')
// teeb sama välja, mis
// const parallelLimit = require('async').parallelLimit


var strapiPath = 'http://' + process.env['StrapiHost']
var savePath = 'assets/img/dynamic/img_persons/'

loadYaml(readYaml)

function loadYaml(readYaml) {
    var doc = ''
    try {
        doc = yaml.safeLoad(fs.readFileSync(`source/_fetchdir/teams.et.yaml`, 'utf8'))

    } catch (e) {
        console.log(e)
    }
    fs.mkdir(`${savePath}`, err => {
        if (err) {
        }
    })
    readYaml(doc)
}

// Read more about closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
function downloadsMaker(url, dest) {
    return function(parallelCB) {
        download(url, dest, parallelCB)
    }
}

function readYaml(doc) {
    let parallelDownloads = []
    for (team of doc) {
        if (team.subTeam) {
            for (subTeam of team.subTeam) {
                if (subTeam.teamMember) {
                    for (teamMember of subTeam.teamMember) {
                        // console.log(teamMember.pictureAtTeam)
                        if (teamMember.pictureAtTeam && teamMember.pictureAtTeam.length > 0) {
                            var imgPath = teamMember.pictureAtTeam[0].url
                            var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1]
                        } else if (teamMember.person && teamMember.person.picture) {
                            var imgPath = teamMember.person.picture.url
                            var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1]
                        }
                        if (imgPath) {
                            // download(`${strapiPath}${imgPath}`, `${savePath}${imgFileName}`, ifError)
                            let url = `${strapiPath}${imgPath}`
                            let dest = `${savePath}${imgFileName}`
                            parallelDownloads.push( downloadsMaker(url, dest) )
                        }
                    }
                }
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
}

function download(url, dest, parallelCB, retrys=5) {
    let fileSizeInBytes = 0
    if (fs.existsSync(dest)) {
        const stats = fs.statSync(dest)
        fileSizeInBytes = stats.size
    }

    try {

    } catch (error) {

    }
    http.get(url, function (response) {
        const { statusCode } = response
        console.log('Status', statusCode, url)
        if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
            var file = fs.createWriteStream(dest)
            response.pipe(file)
            file.on('finish', function () {
                file.close(() => {
                    console.log('Try', retrys, `Downloaded: Teams img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest}`)
                    setTimeout(() => {
                        parallelCB(null, 'downloaded ' + url)
                    }, 500)
                })
            })
        } else {
            // parallelCB(null, 'skipped ' + url)
            console.log('Try', retrys, `Skipped: Teams img ${url.split('/')[url.split('/').length - 1]} due to same exists`)
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


