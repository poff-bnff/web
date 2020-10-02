const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const mapping = {
    'poff.ee': 'TrioPÖFF',
    'justfilm.ee': 'TrioJustFilm',
    'kinoff.poff.ee': 'TrioKinoff',
    'industry.poff.ee': 'TrioIndustry',
    'shorts.poff.ee': 'TrioShorts'
}
const articleMapping = {
    'poff.ee': 'poffi',
    'justfilm.ee': 'just_filmi',
    'kinoff.poff.ee': 'kinoffi_article',
    'industry.poff.ee': 'industry_article',
    'shorts.poff.ee': 'shortsi'
}
const STRAPIDATA_TRIO = STRAPIDATA[mapping[DOMAIN]]

if (STRAPIDATA_TRIO.length < 1) {
    console.log(`ERROR! No data to fetch for ${DOMAIN} trioblock`)
}

const languages = ['en', 'et', 'ru']


for (const lang of languages) {
    console.log(`Fetching ${DOMAIN} trioblock ${lang} data`)

    let copyData = JSON.parse(JSON.stringify(STRAPIDATA_TRIO[0]))
    let buffer = []
    for (key in copyData) {
        if (key.split('_')[1] !== lang) {
            continue
        }
        for (key2 in copyData[key]) {
            if (key2.split('_')[0] !== 'trioItem') {
                continue
            }

            buffer.push({
                'block': copyData[key][key2],
                'article': copyData[key][key2][`${articleMapping[DOMAIN]}_article`]
            })
            delete copyData[key][key2][`${articleMapping[DOMAIN]}_article`]
            delete copyData[key][key2]
        }
    }

    rueten(buffer, lang)
    let allDataYAML = yaml.safeDump(buffer, { 'noRefs': true, 'indent': '4' })
    const outFile = path.join(fetchDir, `articletrioblock.${lang}.yaml`)
    fs.writeFileSync(outFile, allDataYAML, 'utf8')
}
