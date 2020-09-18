const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/');

if (process.env['DOMAIN'] === 'justfilm.ee') {
    var fetchFrom = 'JustFilmiMenu';
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var fetchFrom = 'ShortsiMenu';
} else {
    var fetchFrom = 'POFFiMenu';
}

const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))
DataToYAMLData(strapiData[fetchFrom]);

function DataToYAMLData(strapiData){
    // console.log(strapiData);
    LangSelect(strapiData, 'et');
    LangSelect(strapiData, 'en');
    LangSelect(strapiData, 'ru');
}

function LangSelect(strapiData, lang) {
    processData(strapiData, lang, CreateYAML);
    console.log(`Fetching ${process.env['DOMAIN']} menu ${lang} data`);
}

function processData(data, lang, CreateYAML) {
    let copyData = JSON.parse(JSON.stringify(data));
    // console.log(copyData);
    let buffer = [];
    for (values in copyData) {
            buffer.push(rueten(copyData[values], lang));
    }

    CreateYAML(buffer, lang);
    // console.log(buffer);
}

function CreateYAML(buffer, lang) {
    // console.log(buffer);
    let globalData= yaml.safeLoad(fs.readFileSync(`${sourceFolder}global.${lang}.yaml`, 'utf8'))
    globalData.menu = buffer

    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}global.${lang}.yaml`, allDataYAML, 'utf8');
}


