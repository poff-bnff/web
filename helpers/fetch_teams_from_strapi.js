const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');

const allLanguages = ["en", "et", "ru"];

if (process.env['DOMAIN'] === 'justfilm.ee') {
    var domain = 'justfilm.ee';
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var domain = 'shorts.poff.ee';
} else {
    var domain = 'poff.ee';
}

let allData = []; // for articles view

function fetchAllData(options){
    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData("source/festival/", "en", 0, 1, {'articles': '/articles.en.yaml'}, options, getDataCB);
    getData("source/festival/", "et", 0, 0, {'articles': '/articles.et.yaml'}, options, getDataCB);
    getData("source/festival/", "ru", 0, 0, {'articles': '/articles.ru.yaml'}, options, getDataCB);
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
        path: '/teams',
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + token}
    }

    fetchAllData(options);
}


function getData(dirPath, lang, writeIndexFile, showErrors, dataFrom, options, callback) {
    console.log(`Fetching ${process.env['DOMAIN']} teams ${lang} data`);

    allData = [];
    let req = http.request(options, function(response) {
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            data = JSON.parse(data);
            callback(data, dirPath, lang, writeIndexFile, dataFrom, showErrors);
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


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors) {
    allData = [];
    // data = rueten(data, lang);
    // console.log(data);
    data.forEach(element => {

        if (element.domain && element.domain.url === domain) {
            console.log(domain);
            // console.log(element);
            // rueten func. is run for each element separately instead of whole data, that is
            // for the purpose of saving slug_en before it will be removed by rueten func.
            element = rueten(element, lang);

            // console.log(element.directory);
            // element = rueten(element, `_${lang}`);



            // let element = JSON.parse(JSON.stringify(element));
            // let aliases = []
            // element.aliases = aliases;
            // rueten(element, `_${lang}`);
            allData.push(element);
            element.data = dataFrom;
            generateYaml(element, dirPath, lang, writeIndexFile)
        }

    });

}

function generateYaml(element, dirPath, lang, writeIndexFile){
    let yamlStr = yaml.safeDump(element, { 'indent': '4' });
    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`source/festival/teams.${lang}.yaml`, allDataYAML, 'utf8');
}

function modifyData(element, key, lang){
    finalData = element[key][lang];
    delete element[key];
    element[key] = finalData;
}

getToken();

