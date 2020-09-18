const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/_fetchdir/');

if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var fetchFrom = 'HeroArticleShorts';
} else if (process.env['DOMAIN'] === 'justfilm.ee') {
    var fetchFrom = 'HeroArticleJustFilm';
} else {
    var fetchFrom = 'HeroArticlePoff';
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
    console.log(`Fetching ${process.env['DOMAIN']} heroarticle ${lang} data`);
}


function processData(data, lang, CreateYAML) {
    var buffer = {}
    for (key in data[0]) {
        let smallBuffer = {}
        var data2 = data[key];
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

        if(key === `article_${lang}`) {
            buffer = rueten(data[0][`article_${lang}`], lang);
            // console.log(buffer);
        }
    }


    CreateYAML(buffer, lang);
}

function CreateYAML(buffer, lang) {
    // console.log(buffer);
    let allDataYAML = yaml.safeDump(buffer, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}heroarticle.${lang}.yaml`, allDataYAML, 'utf8');
}


