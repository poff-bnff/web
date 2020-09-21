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
    'poff.ee': 'TrioBlockPoff',
    'justfilm.ee': 'TrioBlockJustFilm',
    'shorts.poff.ee': 'TrioBlockShorts'
}
const STRAPIDATA_TRIO = STRAPIDATA[mapping[DOMAIN]]

if (STRAPIDATA_TRIO.length < 1) {
    console.log(`ERROR! No data to fetch for ${DOMAIN} trioblock`)
}

const languages = ['en', 'et', 'ru']

var fetchFrom = 'TrioBlockPoff'
if (process.env['DOMAIN'] === 'justfilm.ee') {
    fetchFrom = 'TrioBlockJustFilm'
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    fetchFrom = 'TrioBlockShorts'
}

for (const lang of languages) {
    console.log(`Fetching ${DOMAIN} trioblock ${lang} data`)

    let copyData = JSON.parse(JSON.stringify(STRAPIDATA_TRIO[0]))
    let buffer = []
    for (key in copyData) {
        if (key.split('_')[0] !== 'trioBlockItem') {
            continue
        }
        let block_index = key.split('_')[1]

        buffer.push({
            'block': copyData[key],
            'article': copyData[`poffi_article_${block_index}`]
        })
        delete copyData[key]
    }

    copyData = rueten(buffer, lang)
    let allDataYAML = yaml.safeDump(copyData, { 'noRefs': true, 'indent': '4' })
    const outFile = path.join(fetchDir, `articletrioblock.${lang}.yaml`)
    fs.writeFileSync(outFile, allDataYAML, 'utf8')
}
