
const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');

const allLanguages = ["en", "et", "ru"];

let allData = []; // for films view

function fetchAllData(options){
    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData("source/film/", "en", 1, 1, {'pictures': '/film_pictures.yaml', 'screenings': '/film/screenings.en.yaml'}, options, getDataCB);
    getData("source/film/", "et", 0, 0, {'pictures': '/film_pictures.yaml', 'screenings': '/film/screenings.et.yaml'}, options, getDataCB);
    getData("source/film/", "ru", 0, 0, {'pictures': '/film_pictures.yaml', 'screenings': '/film/screenings.ru.yaml'}, options, getDataCB);
}

function getToken() {
    let token = '';

    let requestOptions = {
        host: process.env['StrapiHost'],
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
        host: process.env['StrapiHost'],
        path: '/films',
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
    const regex = new RegExp(`.*_${lang}$`, 'g');

    for (const key in obj) {
        // console.log(obj[key] + ' - ' + Array.isArray(obj[key]));
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
        }

        if (obj[key] === null) {
            delete obj[key];
            continue
        }
        else if (key === lang) {
            // console.log(key, obj[key]);
            return obj[key]
        } else if (key.match(regex) !== null) {
            // console.log(regex, key, key.match(regex));
            obj[key.substring(0, key.length-3)] = obj[key];
            delete obj[key];
        // } else if (Array.isArray(obj[key])) {
        //     obj[key].forEach(element => {
        //         element = rueten(element, lang)
        //     })
        } else if (typeof(obj[key]) === 'object') {
            obj[key] = rueten(obj[key], lang)
            // if (Array.isArray(obj[key])) {
            //     if (typeof(obj[key][0]) === 'string') {
            //         obj[key] = obj[key].join(', ');
            //     }
            // }
        }
        if (Array.isArray(obj[key])) {
            // console.log(key + ' len: ' + obj[key].length + ' entries: ' + obj[key].length);
            // console.log(JSON.stringify(obj[key]));
            if (obj[key].length > 0) {
                for (var i = 0; i < obj[key].length; i++) {
                    if (obj[key][i] === '') {
                        // console.log('EMPTY ONE');
                        obj[key].splice(i, 1);
                        i--;
                    }
                }
                if (obj[key].length === 0) {
                    delete obj[key];
                }
            }else{
                delete obj[key];
            }
        }
    }
    return obj
}


function getDataCB(data, dirPath, lang, copyFile, dataFrom, showErrors) {
    allData = [];
    // data = rueten(data, lang);
    // console.log(data);
    data.forEach(element => {
        let slugEn = element.slug_en;

        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);

        element.directory = dirPath + slugEn;
        // console.log(element.directory);
        // element = rueten(element, `_${lang}`);

        if(element.directory) {
            fs.mkdir(element.directory, err => {
                if (err) {
                }
            });

            // let element = JSON.parse(JSON.stringify(element));
            // let aliases = []
            let languageKeys = ['en', 'et', 'ru'];
            for (key in element) {
                let lastThree = key.substring(key.length - 3, key.length);
                let findHyphen = key.substring(key.length - 3, key.length - 2);
                // if (lastThree !== `_${lang}` && findHyphen === '_' && !allLanguages.includes(lastThree)) {
                //     if (key.substring(0, key.length - 3) == 'slug') {
                //         aliases.push(element[key]);
                //     }
                //     delete element[key];
                // }
                // if (lastThree === `_${lang}`) {
                if (key == 'slug') {
                    element.path = `film/${element[key]}`;
                }
                    // element[key.substring(0, key.length - 3)] = element[key];


                // delete element[key];
                // }

                // Make separate CSV with key

                if (typeof(element[key]) === 'object' && element[key] != null) {
                    // makeCSV(element[key], element, lang);
                }

            }



            // element.aliases = aliases;
            // rueten(element, `_${lang}`);
            allData.push(element);
            element.data = dataFrom;
            generateYaml(element, element, dirPath, lang, copyFile)
        }else{
            if(showErrors) {
                console.log(`Film ID ${element.id} slug_en value missing`);
            }
        }
    });

}

function makeCSV(obj, element, lang) {
    // console.log(obj);
    for (const [key, value] of Object.entries(obj)) {
        if (value && value != '' && !value.toString().includes('[object Object]')) {
            element[`${key}CSV`] = value.toString();
        }else if (value && value != '') {
            // rueten(value, `_${lang}`);
            makeCSV(value, element, lang)
        }
        // console.log(`${key}: ${value}`);
    }
}

function generateYaml(element, element, dirPath, lang, copyFile){
    let yamlStr = yaml.safeDump(element, { 'indent': '4' });

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');
    // console.log(`WRITTEN: ${element.directory}/data.${lang}.yaml`);
    // console.log(element);
    if (copyFile) {
        fs.copyFile(`${dirPath}film_index_template.pug`, `${element.directory}/index.pug`, (err) => {
            if (err) throw err;
            // console.log(`File was copied to folder ${dirPath}${element.slug_en}`);
        })
    }

    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`source/films.${lang}.yaml`, allDataYAML, 'utf8');
}

function modifyData(element, key, lang){
    finalData = element[key][lang];
    delete element[key];
    element[key] = finalData;
}

getToken();

