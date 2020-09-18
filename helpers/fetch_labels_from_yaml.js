const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const rueten = require('./rueten.js')
const util = require('util')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['LabelGroup']

const languages = ['en', 'et', 'ru']
for (const ix in languages) {
    const lang = languages[ix]
    let data = rueten(STRAPIDATA, lang)
    // console.log(data)
    processData(data, lang)
    console.log(`Fetched ${process.env['DOMAIN']} labels ${lang} data`)
}

function processData(data, lang) {
    var buffer = {}
    var labels = {}
    for (key in data) {
        let smallBuffer = {}
        // console.log(data[key].name)
        var data2 = data[key]
        var name = data[key].name
        for (key2 in data2.label) {
            smallBuffer[data2.label[key2].name] = data2.label[key2].value
        }
        buffer[name] = smallBuffer
        labels[name] = buffer[name]
    }
    // console.log(labels)

    const globalDataSourceFile = path.join(sourceDir, `global.static.${lang}.yaml`)
    const globalDataTargetFile = path.join(sourceDir, `global.${lang}.yaml`)
    let globalData = yaml.safeLoad(fs.readFileSync(globalDataSourceFile, 'utf8'))
    globalData.label = labels
    // console.log(util.inspect(globalData, true, 18))
    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(globalDataTargetFile, allDataYAML, 'utf8')
}
