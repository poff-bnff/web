const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/');

const allLanguages = ["en", "et", "ru"];

if (process.env['DOMAIN'] === 'justfilm.ee') {
    var dataModel = 'JustFilmiArticle';
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var dataModel = 'ShortsiArticle';
} else {
    var dataModel = 'POFFiArticle';
}

let allData = []; // for articles view

function fetchAllData(dataModel){
    var dirPath = `${sourceFolder}_fetchdir/articles/`;
    // deleteFolderRecursive(dirPath);

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(dirPath, "en", 1, 1, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.en.yaml', 'articles': '/_fetchdir/articles.en.yaml'}, dataModel, getDataCB);
    getData(dirPath, "et", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.et.yaml', 'articles': '/_fetchdir/articles.et.yaml'}, dataModel, getDataCB);
    getData(dirPath, "ru", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.ru.yaml', 'articles': '/_fetchdir/articles.ru.yaml'}, dataModel, getDataCB);
}

function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
  };

function getData(dirPath, lang, writeIndexFile, showErrors, dataFrom, dataModel, getDataCB) {

    // fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${process.env['DOMAIN']} articles ${lang} data`);

    allData = [];

    const data = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))

    getDataCB(data[dataModel], dirPath, lang, writeIndexFile, dataFrom, showErrors, generateYaml);

}


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors, generateYaml) {
    allData = [];
    // data = rueten(data, lang);
    // console.log(data);
    data.forEach(element => {
        let slugEn = element.slug_en;
        if (!slugEn) {
            slugEn = element.slug_et;
        }

        let doNotTouchTheTypes = [];
        if(element.article_types && element.article_types[0]) {
            for (let typeIndex = 0; typeIndex < element.article_types.length; typeIndex++) {
                const oneType = element.article_types[typeIndex];
                doNotTouchTheTypes.push(oneType);
            }
        }

        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);
        element.article_types = doNotTouchTheTypes;
        element.directory = dirPath + slugEn;
        // console.log(element.directory);
        // element = rueten(element, `_${lang}`);

        if(element.directory) {
            // fs.mkdirSync(element.directory, { recursive: true })

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
                    element.path = `article/${element[key]}`;
                }
                    // element[key.substring(0, key.length - 3)] = element[key];


                //     delete element[key];
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

            generateYaml(element, element, dirPath, lang, writeIndexFile)

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

function generateYaml(element, element, dirPath, lang, writeIndexFile){
    let yamlStr = yaml.safeDump(element, { 'indent': '4' });

    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });

    fs.writeFileSync(`${sourceFolder}_fetchdir/articles.${lang}.yaml`, allDataYAML, 'utf8');
}

function modifyData(element, key, lang){
    finalData = element[key][lang];
    delete element[key];
    element[key] = finalData;
}

// getToken();

fetchAllData(dataModel);
