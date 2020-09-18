const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '../source/');

// FromStrapi.Fetch('LabelGroups', LabelsToYAMLData)

const modelName = 'LabelGroup'
const strapiData = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))

function LabelsToYAMLData(strapiData) {
    LangSelect(strapiData, 'et')
    LangSelect(strapiData, 'en')
    LangSelect(strapiData, 'ru')
}

LabelsToYAMLData(strapiData[modelName])

function LangSelect(strapiData, lang) {
    let data = rueten(strapiData, lang);
    processData(data, lang, CreateYAML);
    console.log(`Fetching ${process.env['DOMAIN']} labels ${lang} data`);
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
    let globalData= yaml.safeLoad(fs.readFileSync(`${sourceFolder}global.${lang}.yaml`, 'utf8'))
    // // console.log(globalData);
    globalData.label = labels
    // // console.log(process.cwd());
    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}global.${lang}.yaml`, allDataYAML, 'utf8');
}


