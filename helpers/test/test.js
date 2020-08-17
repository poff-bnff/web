const fs = require('fs');
var request = require('request');
const yaml = require('js-yaml');


var options = {
  'method': 'GET',
  'url': 'http://139.59.130.149/films',
  'headers': {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwNDA2LCJleHAiOjE1OTk4MzI0MDZ9.ZddzcDSe7O130sr4dtxr2XOSP7j-BTmlOI8TGxWgKdM'
  }
};


function getData(callback, lang, copyFile) {
    request(options, function (error, response) {
        if (error)
            throw new Error(error);
        let data = new Object();
        data = JSON.parse(response.body);
        callback(data, lang, copyFile);
    });
}

function getDataCB(data, lang, copyFile) {

    data.forEach(element => {
        fs.mkdir(`helpers/test/${element.slug_en}`, bla);

        let elementEt = JSON.parse(JSON.stringify(element));

        for (key in elementEt) {
            let lastThree = key.substring(key.length - 3, key.length);
            let findHyphen = key.substring(key.length - 3, key.length -2);
            if (lastThree !== `_${lang}` && findHyphen === '_' && lastThree !== '_by' && lastThree !== '_at') {
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

        fs.writeFileSync(`helpers/test/${element.slug_en}/data.${lang}.yaml`, yamlStr, 'utf8');
        if (copyFile) {
            fs.copyFile(`helpers/test/film_index_template.pug`, `helpers/test/${element.slug_en}/index.pug`, (err) => {
                if (err) throw err;
                console.log(`File was copied to folder ${element.slug_en}`);
                })
        }
    });

}

function bla() {
}

getData(getDataCB, "en", 1);
getData(getDataCB, "et", 0);
getData(getDataCB, "ru", 0);



// for (x in data) {
//     console.log('bla: ' + x.id);
// }
