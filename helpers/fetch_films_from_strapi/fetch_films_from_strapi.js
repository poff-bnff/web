
const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');

const allLanguages = ["en", "et", "ru"];

function getToken() {
    let token = '';

    let requestOptions = {
        host: '139.59.130.149',
        path: '/auth/local',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }
    let requesting = http.request(requestOptions, function(response) {
        let tokenStr = '';
        //another chunk of data has been received, so append it to `token`
        response.on('data', function (chunk) {
          tokenStr += chunk;
        });
        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            let token = JSON.parse(tokenStr)
            fetchAll(token)
        });
        response.on('error', function (error) {
            console.log(error);
        })
    })
    requesting.write(JSON.stringify({
            "identifier":process.env['StrapiUserName'],
            "password":process.env['StrapiPassword']
        })
    )
    requesting.on('error', function (error) {
        console.log(error);
    })
    requesting.end(function () {
    })


}

function fetchAll(token) {
    token = token.jwt;

    let options = {
        host: '139.59.130.149',
        path: '/films',
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token}
    }

    // getData(function, new directory path, language, copy file)

    fetchAllData(options);
}


function getData(dirPath, lang, copyFile, options, callback) {
    let req = http.request(options, function(response) {
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            data = JSON.parse(data);
            callback(data, dirPath, lang, copyFile);
        });
    }).end();
}

function getDataCB(data, dirPath, lang, copyFile) {
    data.forEach(element => {
        fs.mkdir(`${dirPath}${element.slug_en}`, err => {
            if (err) {
            }
            });

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
        generateYaml(element, elementEt, dirPath, lang, copyFile)

    });

}

function fetchAllData(options){
    getData("helpers/fetch_films_from_strapi/", "en", 1, options, getDataCB);
    getData("helpers/fetch_films_from_strapi/", "et", 0, options, getDataCB);
    getData("helpers/fetch_films_from_strapi/", "ru", 0, options, getDataCB);
}


function generateYaml(element, elementEt, dirPath, lang, copyFile){
    let yamlStr = yaml.safeDump(elementEt, { 'indent': '4' });

    fs.writeFileSync(`${dirPath}${element.slug_en}/data.${lang}.yaml`, yamlStr, 'utf8');
    if (copyFile) {
        fs.copyFile(`${dirPath}film_index_template.pug`, `${dirPath}${element.slug_en}/index.pug`, (err) => {
            if (err) throw err;
            console.log(`File was copied to folder ${dirPath}${element.slug_en}`);
        })
    }
}


getToken();

