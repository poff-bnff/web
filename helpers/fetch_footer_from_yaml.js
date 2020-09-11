const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const sourceFolder =  path.join(__dirname, '../source/');

if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    var domain = 'shorts.poff.ee';
} else if (process.env['DOMAIN'] === 'justfilm.ee') {
    var domain = 'justfilm.ee';
} else {
    var domain = 'poff.ee';
}

const modelName = 'Footer'
const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/strapiData.yaml', 'utf8'))

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
    let copyData = JSON.parse(JSON.stringify(data));
    console.log('DATA: ' + data);
    let buffer = [];
    for (values in copyData) {
        // console.log(values)

        if(copyData[values].domain.url === domain) {
            buffer = rueten(copyData[values], lang);
        }
        // console.log(copyData[values].domain.url);
    }
    CreateYAML(buffer, lang);
    // console.log(buffer);
}

function CreateYAML(buffer, lang) {
    // console.log(buffer);
    let globalData= yaml.safeLoad(fs.readFileSync(`${sourceFolder}global.${lang}.yaml`, 'utf8'))
    // console.log(globalData);
    globalData.footer = buffer

    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}global.${lang}.yaml`, allDataYAML, 'utf8');
}


