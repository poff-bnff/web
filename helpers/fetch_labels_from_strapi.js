const fs = require('fs');
const yaml = require('js-yaml');
const FromStrapi = require('./strapi/FromStrapi.js');

console.log('DOMAIN', process.env['DOMAIN'])

// FromStrapi.Fetch('LabelGroups', LabelsToYAMLData)

const modelName = 'LabelGroup'
const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/strapiData.yaml', 'utf8'))
console.log(__dirname + '/../source/strapiData.yaml')

function LabelsToYAMLData(strapiData) {
    LangSelect(strapiData, 'et')
    LangSelect(strapiData, 'en')
    LangSelect(strapiData, 'ru')
}

LabelsToYAMLData(strapiData[modelName])

function LangSelect(strapiData, lang) {
    let data = rueten(strapiData, lang);
    processData(data, lang, CreateYAML);
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
        if (key === 'id') {
            delete obj[key];
            continue
        }
        else if (key === lang) {
            // console.log(key, obj[key]);
            return obj[key]
        } else if (key.match(regex) !== null) {
            // console.log(regex, key, key.match(regex));
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
    var labels = {}
    for (key in data) {
        let smallBuffer = {}
        // console.log(data[key].name);
        var data2 = data[key];
        var name = data[key].name;
        for (key2 in data2.label) {
            smallBuffer[data2.label[key2].name] = data2.label[key2].value;
        }
        buffer[name] = smallBuffer;
        labels[name] = buffer[name]
    }

    CreateYAML(rueten(labels, lang), lang);
    // CreateYAML(labels, lang);
}

function CreateYAML(labels, lang) {
    // console.log(labels);
    let globalData= yaml.safeLoad(fs.readFileSync(`../source/global.${lang}.yaml`, 'utf8'))
    // // console.log(globalData);
    globalData.label = labels
    // // console.log(process.cwd());
    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`../source/global.${lang}.yaml`, allDataYAML, 'utf8');
}


