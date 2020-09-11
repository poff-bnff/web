const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const sourceFolder =  path.join(__dirname, '../source/');

if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var fetchFrom = 'HeroArticleShorts';
} else if (process.env['DOMAIN'] === 'justfilm.ee') {
    var fetchFrom = 'HeroArticleJustFilm';
} else {
    var fetchFrom = 'HeroArticlePoff';
}

const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/strapiData.yaml', 'utf8'))
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
        // if (key === 'id') {
        //     delete obj[key];
        //     continue
        // }
        else if (key === lang) {
            // console.log(key, obj[key]);
            return obj[key]
        } else if (key.match(regex) !== null) {
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


