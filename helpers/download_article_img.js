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
var savePath = 'assets/img/img_articles/';

loadYaml('et', readYaml);
loadYaml('en', readYaml);

function loadYaml(lang, readYaml) {
    var doc = '';
    try {
        doc = yaml.safeLoad(fs.readFileSync(`source/articles.${lang}.yaml`, 'utf8'));

    } catch (e) {
        console.log(e);
    }
    fs.mkdir(`${savePath}${lang}`, err => {
        if (err) {
        }
    });
    readYaml(lang, doc);
}

function readYaml(lang, doc) {

    for (values of doc) {
        if (!values.slug) {
            continue;
        }else{
            fs.mkdir(`${savePath}${lang}/${values.slug}`, err => {
            });
        }

        if (values.media.imageDefault) {
            var imgPath = values.media.imageDefault[0].url;
            var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
            fs.mkdir(`${savePath}${lang}/${values.slug}`, err => {
            });
            download(`${strapiPath}${imgPath}`, `${savePath}${lang}/${values.slug}/${imgFileName}`, ifError);
        }
        if (values.media.image[0]) {
            var imgPath = values.media.image[0].url;
            var imgFileName = imgPath.split('/')[imgPath.split('/').length - 1];
            download(`${strapiPath}${imgPath}`, `${savePath}${lang}/${values.slug}/${imgFileName}`, ifError);
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
        console.log(`File ${url.split('/')[url.split('/').length - 1]} downloaded to ${dest}`);
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
