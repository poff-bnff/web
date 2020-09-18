const fs = require('fs');
const yaml = require('js-yaml');
const http = require('http');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/_fetchdir/');
const writeToFilePath = sourceFolder;

const allLanguages = ["en", "et", "ru"];

if (process.env['DOMAIN'] === 'justfilm.ee') {
    var domain = 'justfilm.ee';
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var domain = 'shorts.poff.ee';
} else {
    var domain = 'poff.ee';
}

let allData = []; // for articles view

var fetchFrom = 'Team';

function fetchAllData(fetchFrom){
    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData("source/festival/", "en", 0, 1, {'articles': '/_fetchdir/articles.en.yaml'}, fetchFrom, getDataCB);
    getData("source/festival/", "et", 0, 0, {'articles': '/_fetchdir/articles.et.yaml'}, fetchFrom, getDataCB);
    getData("source/festival/", "ru", 0, 0, {'articles': '/_fetchdir/articles.ru.yaml'}, fetchFrom, getDataCB);
}

function getData(dirPath, lang, writeIndexFile, showErrors, dataFrom, fetchFrom, callback) {
    console.log(`Fetching ${process.env['DOMAIN']} teams ${lang} data`);

    allData = [];

    const data = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))

    callback(data[fetchFrom], dirPath, lang, writeIndexFile, dataFrom, showErrors);
}


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors) {
    allData = [];
    data.forEach(element => {

        if (element.domain && element.domain.url === domain) {
            // rueten func. is run for each element separately instead of whole data, that is
            // for the purpose of saving slug_en before it will be removed by rueten func.
            element = rueten(element, lang);

            allData.push(element);
            element.data = dataFrom;
            generateYaml(element, dirPath, lang, writeIndexFile)
        }

    });

}

function generateYaml(element, dirPath, lang, writeIndexFile){
    let yamlStr = yaml.safeDump(element, { 'indent': '4' });
    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${writeToFilePath}teams.${lang}.yaml`, allDataYAML, 'utf8');
}

fetchAllData(fetchFrom)
