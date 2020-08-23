
const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');

const allLanguages = ["en", "et", "ru"];

let allData = []; // for articles view

function fetchAllData(options){
    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData("source/article/", "en", 1, 1, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.en.yaml'}, options, getDataCB);
    getData("source/article/", "et", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.et.yaml'}, options, getDataCB);
    getData("source/article/", "ru", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.ru.yaml'}, options, getDataCB);
}

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
        path: '/articles',
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token}
    }

    fetchAllData(options);
}


function getData(dirPath, lang, copyFile, showErrors, dataFrom, options, callback) {
    allData = [];
    let req = http.request(options, function(response) {
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            data = JSON.parse(data);
            callback(data, dirPath, lang, copyFile, dataFrom, showErrors);
        });
    }).end();
}

function rueten(obj, lang) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
        }

        if (obj[key] === null) {
            continue
        } else if (key === lang) {
            return obj[key]
        } else if (typeof(obj[key]) === 'list') {
            obj[key].forEach(element => {
                element = rueten(element, lang)
            })
        } else if (typeof(obj[key]) === 'object') {
            obj[key] = rueten(obj[key], lang)
        }
    }
    return obj
}


function getDataCB(data, dirPath, lang, copyFile, dataFrom, showErrors) {
    allData = [];
    data.forEach(element => {
        element = rueten(element, lang);
        //console.log(element);

        if(element.slug_en) {
            fs.mkdir(`${dirPath}${element.slug_en}`, err => {
                if (err) {
                }
            });

            let elementEt = JSON.parse(JSON.stringify(element));
            // let aliases = []
            let languageKeys = ['en', 'et', 'ru'];
            for (key in elementEt) {
                let lastThree = key.substring(key.length - 3, key.length);
                let findHyphen = key.substring(key.length - 3, key.length - 2);
                // if (lastThree !== `_${lang}` && findHyphen === '_' && !allLanguages.includes(lastThree)) {
                //     if (key.substring(0, key.length - 3) == 'slug') {
                //         aliases.push(elementEt[key]);
                //     }
                //     delete elementEt[key];
                // }
                if (lastThree === `_${lang}`) {
                    if (key.substring(0, key.length - 3) == 'slug') {
                        elementEt.path = `article/${elementEt[key]}`;
                    }
                    elementEt[key.substring(0, key.length - 3)] = elementEt[key];


                    delete elementEt[key];
                }

                // // Make separate CSV with key
                // if (typeof(elementEt[key]) === 'object' && elementEt[key] !== null) {
                //     var nameOfObject = elementEt[key]
                //     for (const [key, value] of Object.entries(nameOfObject)) {
                //         if (value && value != '' && !value.toString().includes('[object Object]')) {
                //             elementEt[`${key}CSV`] = value.toString();
                //         }
                //         console.log(`${key}: ${value}`);
                //     }
                // }

            }



            // elementEt.aliases = aliases;
            allData.push(elementEt);
            elementEt.data = dataFrom;
            generateYaml(element, elementEt, dirPath, lang, copyFile)
        }else{
            if(showErrors) {
                console.log(`Article ID ${element.id} slug_en value missing`);
            }
        }
    });

}

function generateYaml(element, elementEt, dirPath, lang, copyFile){
    let yamlStr = yaml.safeDump(elementEt, { 'indent': '4' });

    fs.writeFileSync(`${dirPath}${element.slug_en}/data.${lang}.yaml`, yamlStr, 'utf8');
    if (copyFile) {
        fs.copyFile(`${dirPath}article_index_template.pug`, `${dirPath}${element.slug_en}/index.pug`, (err) => {
            if (err) throw err;
            // console.log(`File was copied to folder ${dirPath}${element.slug_en}`);
        })
    }

    let allDataYAML = yaml.safeDump(allData, { 'indent': '4' });
    fs.writeFileSync(`source/articles.${lang}.yaml`, allDataYAML, 'utf8');

}

function modifyData(elementEt, key, lang){
    finalData = elementEt[key][lang];
    delete elementEt[key];
    elementEt[key] = finalData;
}

getToken();

