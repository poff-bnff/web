const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA_TEAM = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Team']
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const writeToFilePath = fetchDir


const languages = ['en', 'et', 'ru']
for (const lang of languages) {
    console.log(`Fetching ${DOMAIN} teams ${lang} data`)

    allData = []
    for (const ix in STRAPIDATA_TEAM) {
        let element = STRAPIDATA_TEAM[ix]
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
