const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA_LABELGROUP = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['LabelGroup']
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const sourceFolder =  path.join(__dirname, '../source/');

// FromStrapi.Fetch('LabelGroups', LabelsToYAMLData)

LangSelect('et')
LangSelect('en')
LangSelect('ru')

function LangSelect(lang) {
    let data = rueten(STRAPIDATA_LABELGROUP, lang);
    processData(data, lang, CreateYAML);
    console.log(`Fetching ${DOMAIN} labels ${lang} data`);
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
    const globalStatic = path.join(sourceFolder, 'global_static', `global_s.${lang}.yaml`)
    console.log(globalStatic)
    let globalData= yaml.safeLoad(fs.readFileSync(globalStatic, 'utf8'))
    // // console.log(globalData);
    globalData.label = labels
    // // console.log(process.cwd());
    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(`${sourceFolder}global.${lang}.yaml`, allDataYAML, 'utf8');
}


