const fs = require('fs');
var request = require('request');
const yaml = require('js-yaml');

const allLanguages = ["en", "et", "ru"];

var options = {
  'method': 'GET',
  'url': 'http://139.59.130.149/films',
  'headers': {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwNDA2LCJleHAiOjE1OTk4MzI0MDZ9.ZddzcDSe7O130sr4dtxr2XOSP7j-BTmlOI8TGxWgKdM'
  }
};


function getData(callback, dirPath, lang, copyFile) {
    request(options, function (error, response) {
        if (error)
            throw new Error(error);
        let data = new Object();
        data = JSON.parse(response.body);
        callback(data, dirPath, lang, copyFile);
    });
}

function getDataCB(data, dirPath, lang, copyFile) {

    data.forEach(element => {
        fs.mkdir(`${dirPath}${element.slug_en}`, bla);

        let elementEt = JSON.parse(JSON.stringify(element));

        for (key in elementEt) {
            let lastThree = key.substring(key.length - 3, key.length);
            let findHyphen = key.substring(key.length - 3, key.length -2);
            if (lastThree !== `_${lang}` && findHyphen === '_' && !allLanguages.includes(lastThree)) {
                delete elementEt[key];
            }
            if(lastThree === `_${lang}`) {
                if(key.substring(0, key.length -3) == 'slug') {
                    elementEt.path = elementEt[key];
                }
                elementEt[key.substring(0, key.length -3)] = elementEt[key];
                delete elementEt[key];
            }
        }

        let yamlStr = yaml.safeDump(elementEt, {'indent':'4'});

        fs.writeFileSync(`${dirPath}${element.slug_en}/data.${lang}.yaml`, yamlStr, 'utf8');
        if (copyFile) {
            fs.copyFile(`${dirPath}film_index_template.pug`, `${dirPath}${element.slug_en}/index.pug`, (err) => {
                if (err) throw err;
                console.log(`File was copied to folder ${dirPath}${element.slug_en}`);
                })
        }
    });

}

function bla() {
}

// getData(function, new directory path, language, copy file)
getData(getDataCB, "helpers/test/", "en", 1);
getData(getDataCB, "helpers/test/", "et", 0);
getData(getDataCB, "helpers/test/", "ru", 0);

// for (x in data) {
//     console.log('bla: ' + x.id);
// }
