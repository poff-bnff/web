const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/_fetchdir/');

if (process.env['DOMAIN'] === 'justfilm.ee') {
    var fetchFrom = 'TrioBlockJustFilm';
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var fetchFrom = 'TrioBlockShorts';
} else {
    var fetchFrom = 'TrioBlockPoff';
}

const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))
DataToYAMLData(strapiData[fetchFrom]);


function DataToYAMLData(strapiData){
    // console.log(strapiData[0]);
    LangSelect(strapiData, 'et');
    LangSelect(strapiData, 'en');
    LangSelect(strapiData, 'ru');
}

function LangSelect(strapiData, lang) {
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
        // console.log(data2);
        // var name = data[key].name;
        // for (key2 in data2.label) {
        //     // console.log(data2.label[key]);
        //     // smallBuffer[data2.label[key2].name] = {
        //     //     'value' : data2.label[key2].value,
        //     //     'value_en' : data2.label[key2].value_en
        //     //     }
        //     let tinyBuffer = {};
        //     for(key3 in data2.label[key2]) {
        //         tinyBuffer[key3] = data2.label[key2][key3];
        //     }
        //     smallBuffer[data2.label[key2].name] = tinyBuffer;
        // }

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
    // buffer = rueten(buffer, lang);
    // data.blocks = JSON.parse(buffer);
    // console.log(data);
    // buffer = rueten(data, lang);
    // console.log(buffer);
    // copyData.blocks = buffer

    copyData = rueten(buffer, lang);
    CreateYAML(buffer, lang);
}

function CreateYAML(copyData, lang) {
    // console.log(copyData);
    let allDataYAML = yaml.safeDump(copyData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}articletrioblock.${lang}.yaml`, allDataYAML, 'utf8');
}


