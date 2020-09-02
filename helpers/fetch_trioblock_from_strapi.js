const fs = require('fs');
const yaml = require('js-yaml');
const FromStrapi = require('./strapi/FromStrapi.js');

FromStrapi.ValidateAndFetch('TrioBlockPoff', DataToYAMLData);

function DataToYAMLData(strapiData){
    // console.log(strapiData);
    LangSelect(strapiData, 'et');
    LangSelect(strapiData, 'en');
}

function LangSelect(strapiData, lang) {
    processData(strapiData, lang, CreateYAML);
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
        // else
        if (key === lang) {
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
            console.log(copyData[key].poffi_article.publishFrom);
            buffer.push(copyData[key]);
            // console.log(copyData[key]);
            delete copyData[key]
        }

    }
    // buffer = rueten(buffer, lang);
    // data.blocks = JSON.parse(buffer);
    // console.log(data);
    // buffer = rueten(data, lang);
    // console.log(buffer);
    copyData.blocks = buffer
    copyData = rueten(copyData, lang);
    CreateYAML(copyData, lang);
}

function CreateYAML(copyData, lang) {
    // console.log(copyData);
    let allDataYAML = yaml.safeDump(copyData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`../source/articletrioblock.${lang}.yaml`, allDataYAML, 'utf8');
}


