
const fs = require('fs');
let request = require('request');
const yaml = require('js-yaml');

const allLanguages = ["en", "et", "ru"];

function getToken() {
    let token = '';

    let optionsAuth = {
        'method': 'POST',
        'url': 'http://139.59.130.149/auth/local',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "identifier": process.env.StrapiUserName, "password": process.env.StrapiPassword })
    };

    request(optionsAuth, function (error, response) {
        if (error) throw new Error(error);
        token = JSON.parse(response.body).jwt;

        let options = {
            'method': 'GET',
            'url': 'http://139.59.130.149/films',
            'headers': {
                'Authorization': 'Bearer ' + token
            }
        };

        // getData(function, new directory path, language, copy file)
        getData("helpers/test/", "en", 1, getDataCB);
        getData("helpers/test/", "et", 0, getDataCB);
        getData("helpers/test/", "ru", 0, getDataCB);

        function getData(dirPath, lang, copyFile, callback) {
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
                    let findHyphen = key.substring(key.length - 3, key.length - 2);
                    if (lastThree !== `_${lang}` && findHyphen === '_' && !allLanguages.includes(lastThree)) {
                        delete elementEt[key];
                    }
                    if (lastThree === `_${lang}`) {
                        if (key.substring(0, key.length - 3) == 'slug') {
                            elementEt.path = elementEt[key];
                        }
                        elementEt[key.substring(0, key.length - 3)] = elementEt[key];
                        delete elementEt[key];
                    }
                }

                let yamlStr = yaml.safeDump(elementEt, { 'indent': '4' });

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
    });


}

getToken();

