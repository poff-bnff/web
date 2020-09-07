const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const FileReader = require('filereader');
const http = require('http');
const fs = require('fs');
const yaml = require('js-yaml');

// var blob = null;
// var xhr = new XMLHttpRequest();
// xhr.open("GET", "http://'+ process.env['StrapiHost']+'/uploads/F_3_invisible_life_fb118ee4f7.jpg");
// xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
// xhr.onload = function()
// {
//     blob = xhr.response;//xhr.response is now a blob object
// }
// xhr.send();

// console.log(blob);

var strapiPath = 'http://' + process.env['StrapiHost'];
var savePath = 'assets/img/img_footer/';

loadYaml(readYaml);

function loadYaml(readYaml) {
    var doc = '';
    try {
        doc = yaml.safeLoad(fs.readFileSync(`source/global.et.yaml`, 'utf8'));

    } catch (e) {
        // console.log(e);
    }
    fs.mkdir(`${savePath}`, err => {
        if (err) {
        }
    });
    readYaml(doc);
}

function readYaml(doc) {
    if (doc.footer.logosSections) {
        for (const ix in doc.footer.logosSections) {
            const section = doc.footer.logosSections[ix]
            for (const i in section.logo) {
                const logo = section.logo[i]
                if ('imgWhite' in logo && 'url' in logo.imgWhite){
                    var imgPathW = logo.imgWhite.url;
                    var imgFileName = imgPathW.split('/')[imgPathW.split('/').length - 1];
                    download(`${strapiPath}${imgPathW}`, `${savePath}${imgFileName}`, ifError);
                }

                if ('imgColor' in logo && 'url' in logo.imgColour){
                    var imgPathC = logo.imgColour.url;
                    var imgFileName = imgPathC.split('/')[imgPathC.split('/').length - 1];
                    download(`${strapiPath}${imgPathC}`, `${savePath}${imgFileName}`, ifError);
                }

                if ('imgBlack' in logo && 'url' in logo.imgBlack){
                    var imgPathB = logo.imgBlack.url;
                    var imgFileName = imgPathB.split('/')[imgPathB.split('/').length - 1];
                    download(`${strapiPath}${imgPathB}`, `${savePath}${imgFileName}`, ifError);
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
                    var imgPath = items.svgMedia.url;
                    var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
                    download(`${strapiPath}${imgPath}`, `${savePath}${imgFileName}`, ifError);
                }
            }
        }
    }
    if (doc.footer.item) {
        for (const ix in doc.footer.item) {
            const item = doc.footer.item[ix]
            if ('image' in item && 'url' in item.image) {
                // console.log(item.image);
                var imgPath = item.image.url;
                var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
                download(`${strapiPath}${imgPath}`, `${savePath}${imgFileName}`, ifError);
            }
        }

        for (const ix in doc.footer.item) {
            const item = doc.footer.item[ix]
            for (const i in item.svgItem) {
                const media = item.svgItem[i]
                if('svgMedia' in media &&'url' in media.svgMedia) {
                    // console.log(media.svgMedia.url);
                    var imgPath = media.svgMedia.url;
                    var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
                    download(`${strapiPath}${imgPath}`, `${savePath}${imgFileName}`, ifError);
                }
            }
        }
    }
}


function download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(cb);  // close() is async, call cb after close completes.
        });
        console.log(`Footer img ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest}`);
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};



// download(`${strapiPath}${imgPath}`, `${savePath}${imgFileName}`, ifError);

function ifError(error, url, dest) {
    if (error) {
        console.log(`ERROR: ${error}`);
    } else {
        // console.log(`File ${imgFileName} downloaded to ${savePath}`);

    }
}

// var myReader = new FileReader();
// myReader.readAsArrayBuffer(blob)
// myReader.addEventListener("loadend", function(e)
// {
//         var buffer = e.srcElement.result;//arraybuffer object
// });

// // new File("");

// function readImage(file) {
//     // Check if the file is an image.
//     if (file.type && file.type.indexOf('image') === -1) {
//       console.log('File is not an image.', file.type, file);
//       return;
//     }

//     const reader = new FileReader();
//     reader.addEventListener('load', (event) => {
//       img.src = event.target.result;
//     });
//     reader.readAsDataURL(file);
//   }
