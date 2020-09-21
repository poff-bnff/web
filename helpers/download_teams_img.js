const http = require('http');
const fs = require('fs');
const yaml = require('js-yaml');


var strapiPath = 'http://' + process.env['StrapiHost'];
var savePath = 'assets/img/img_persons/';

loadYaml(readYaml);

function loadYaml(readYaml) {
    var doc = '';
    try {
        doc = yaml.safeLoad(fs.readFileSync(`source/_fetchdir/teams.et.yaml`, 'utf8'));

    } catch (e) {
        console.log(e);
    }
    fs.mkdir(`${savePath}`, err => {
        if (err) {
        }
    });
    readYaml(doc);
}

function readYaml(doc) {

    for (team of doc) {
        if (team.subTeam) {
            for (subTeam of team.subTeam) {
                if (subTeam.teamMember) {
                    for (teamMember of subTeam.teamMember) {
                        // console.log(teamMember.pictureAtTeam);
                        if (teamMember.pictureAtTeam && teamMember.pictureAtTeam.length > 0) {
                            var imgPath = teamMember.pictureAtTeam[0].url;
                            var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
                        } else if (teamMember.person && teamMember.person.picture) {
                            var imgPath = teamMember.person.picture.url;
                            var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
                        }
                        if (imgPath) {
                            // download(`${strapiPath}${imgPath}`, `${savePath}${imgFileName}`, ifError);
                            let url = `${strapiPath}${imgPath}`
                            let dest = `${savePath}${imgFileName}`
                            download(url, dest);
                        }
                    }
                }
            }
        }
    }
}

function download(url, dest) {
    let fileSizeInBytes = 0
    if (fs.existsSync(dest)) {
        const stats = fs.statSync(dest);
        fileSizeInBytes = stats.size;
    }

    var request = http.get(url, function (response) {
        if (response.headers["content-length"] !== fileSizeInBytes.toString()) {
            var file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', function () {
                file.close();  // close() is async, call cb after close completes.
                console.log(`Downloaded: Teams img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest}`);
            });
        } else {
            // console.log(`Skipped: Teams img ${url.split('/')[url.split('/').length - 1]} due to same exists`);
        }
    }).on('error', function (err) {
        console.log(err)
    })
};


