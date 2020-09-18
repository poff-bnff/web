const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '..', 'source', '_fetchdir/')

var fetchFrom = 'TrioBlockPoff'
if (process.env['DOMAIN'] === 'justfilm.ee') {
    fetchFrom = 'TrioBlockJustFilm'
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    fetchFrom = 'TrioBlockShorts'
}

const STRAPIDATA = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))
LangSelect(fetchFrom, 'et');
LangSelect(fetchFrom, 'en');
LangSelect(fetchFrom, 'ru');


function LangSelect(fetchFrom, lang) {
    let strapiData = STRAPIDATA[fetchFrom]
    if (strapiData.length < 1) {
        console.log(`ERROR! No data to fetch for ${process.env['DOMAIN']} trioblock ${lang}`);
    } else {
        processData(strapiData, lang, CreateYAML);
        console.log(`Fetching ${process.env['DOMAIN']} trioblock ${lang} data`);
    }
}

function processData(data, lang, CreateYAML) {
    let copyData = JSON.parse(JSON.stringify(data[0]));
    let buffer = [];
    for (key in copyData) {
        let smallBuffer = {}
        var data2 = copyData[key];

        // console.log(key);
        if(key.substr(0, key.length-2) === 'trioBlockItem') {
            // console.log(copyData[`poffi_article${key.substr(key.length-2, key.length)}`]);
            smallBuffer.block = copyData[key];
            smallBuffer.article = copyData[`poffi_article${key.substr(key.length-2, key.length)}`];
            buffer.push(smallBuffer);

            // console.log(copyData[key]);
            delete copyData[key]
        }

    }

    copyData = rueten(buffer, lang);
    CreateYAML(buffer, lang);
}

function CreateYAML(copyData, lang) {
    // console.log(copyData);
    let allDataYAML = yaml.safeDump(copyData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}articletrioblock.${lang}.yaml`, allDataYAML, 'utf8');
}


