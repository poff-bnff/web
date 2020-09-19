const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const util = require('util');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/');

if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var domain = 'shorts.poff.ee';
} else if (process.env['DOMAIN'] === 'justfilm.ee') {
    var domain = 'justfilm.ee';
} else {
    var domain = 'poff.ee';
}

const modelName = 'Footer'
const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))

DataToYAMLData(strapiData[modelName]);

function DataToYAMLData(strapiData){
    // console.log(strapiData);
    LangSelect(strapiData, 'et');
    LangSelect(strapiData, 'en');
    LangSelect(strapiData, 'ru');
}

function LangSelect(strapiData, lang) {
    processData(strapiData, lang, CreateYAML);
    console.log(`Fetching ${process.env['DOMAIN']} footer ${lang} data`);
}


function processData(data, lang, CreateYAML) {
    // console.log(util.inspect(data));


    let copyData = JSON.parse(JSON.stringify(data));
    // console.log(util.inspect(copyData));
    let buffer = [];
    for (index in copyData) {
        // console.log('index', index);
        // console.log('domain', domain);
        // console.log('copydatadomeen', copyData[index].domain);
        if(copyData[index].domain.url === domain) {
            buffer = rueten(copyData[index], lang);
        }
    }
    CreateYAML(buffer, lang);
    // console.log('COPYDATA', copyData.keys());
    // console.log('BUFFER', buffer);
}

function CreateYAML(buffer, lang) {
    // console.log(buffer);
    let globalData= yaml.safeLoad(fs.readFileSync(`${sourceFolder}global_static/global_s.${lang}.yaml`, 'utf8'))
    // console.log(globalData);
    globalData.footer = buffer

    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}global.${lang}.yaml`, allDataYAML, 'utf8');
    // console.log(`${sourceFolder}global.${lang}.yaml`);
}


