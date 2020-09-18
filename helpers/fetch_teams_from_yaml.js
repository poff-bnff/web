const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder =  path.join(__dirname, '..', 'source', '_fetchdir')
const strapiDataPath = path.join(sourceFolder, 'strapiData.yaml')
const writeToFilePath = sourceFolder

const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Team']

const languages = ['en', 'et', 'ru']
for (const ix in languages) {
    const lang = languages[ix]
    console.log(`Fetching ${DOMAIN} teams ${lang} data`)

    allData = []
    for (const ix in STRAPIDATA) {
        let element = STRAPIDATA[ix]
        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang)
        element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'}
        allData.push(element)
        const allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
        const yamlPath = path.join(writeToFilePath, `teams.${lang}.yaml`)
        fs.writeFileSync(yamlPath, allDataYAML, 'utf8')
    }
}
