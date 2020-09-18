const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source');
const fetchDir =  path.join(sourceDir, '_fetchdir');
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml');
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['LabelGroup'];

const languages = ['en', 'et', 'ru'];
for (const ix in languages) {
    const lang = languages[ix];
    let data = rueten(STRAPIDATA, lang);
    processData(data, lang);
    console.log(`Fetched ${process.env['DOMAIN']} labels ${lang} data`);
}

function processData(data, lang) {
    var buffer = {};
    var labels = {};
    for (key in data) {
        let smallBuffer = {};
        var data2 = data[key];
        var name = data[key].name;
        for (key2 in data2.label) {
            smallBuffer[data2.label[key2].name] = data2.label[key2].value;
        }
        buffer[name] = smallBuffer;
        labels[name] = buffer[name];
    }

    const globalDataSourceFile = path.join(sourceDir, `global.static.${lang}.yaml`);
    const globalDataTargetFile = path.join(sourceDir, `global.${lang}.yaml`);
    let globalData = yaml.safeLoad(fs.readFileSync(globalDataSourceFile, 'utf8'));
    globalData.label = JSON.parse(JSON.stringify(labels));

    // , skipInvalid: true - töötab ka kui ei tee koopiat
    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4'});
    fs.writeFileSync(globalDataTargetFile, allDataYAML, {encoding:'utf8', flag:'w'});
}
