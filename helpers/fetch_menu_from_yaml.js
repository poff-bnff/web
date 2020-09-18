const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')

const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const mapping = {
    'poff.ee': 'POFFiMenu',
    'justfilm.ee': 'JustFilmiMenu',
    'shorts.poff.ee': 'ShortsiMenu'
}

const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIMENUDATA = STRAPIDATA[mapping[DOMAIN]]

const languages = ['en', 'et', 'ru']
for (const ix in languages) {
    const lang = languages[ix]

    const globalDataFile =  path.join(sourceDir, `global.${lang}.yaml`)
    let globalData = yaml.safeLoad(fs.readFileSync(globalDataFile, 'utf8'))
    globalData.menu = []

    let copyData = JSON.parse(JSON.stringify(STRAPIMENUDATA))
    for (values in copyData) {
        globalData.menu.push(rueten(copyData[values], lang))
    }

    let globalDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(globalDataFile, globalDataYAML, 'utf8')
    console.log(`Fetched ${DOMAIN} menu ${lang} data`)
}
