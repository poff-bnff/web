const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['SixFilms']
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const mapping = {
    'poff.ee': 'poff.ee',
    'justfilm.ee': 'justfilm.ee',
    'kinoff.poff.ee': 'kinoff.poff.ee',
    'industry.poff.ee': 'industry.poff.ee',
    'shorts.poff.ee': 'shorts.poff.ee'
}

const STRAPIDATA_SIXFILMS = STRAPIDATA

const languages = ['en', 'et', 'ru']


for (const lang of languages) {
    if (STRAPIDATA_SIXFILMS.length < 1) {
        console.log(`ERROR! No data to fetch for ${DOMAIN} six films`)
        const outFile = path.join(fetchDir, `sixfilms.${lang}.yaml`)
        fs.writeFileSync(outFile, '', 'utf8')
        continue
    }
    console.log(`Fetching ${DOMAIN} six films ${lang} data`)

    let copyData = JSON.parse(JSON.stringify(STRAPIDATA_SIXFILMS[0]))
    if (typeof copyData !== 'undefined') {

        for (key in copyData) {
            if (key === `cassettes_${lang}`) {
                for (cassetteIx in copyData[key]) {
                    let thisCassette = copyData[key][cassetteIx]
                    const cassetteYAMLPath = path.join(fetchDir, `cassettes.${lang}.yaml`)
                    const CASSETTESYAML = yaml.safeLoad(fs.readFileSync(cassetteYAMLPath, 'utf8'))
                    let thisCassetteFromYAML = CASSETTESYAML.filter( (a) => { return thisCassette.id === a.id })[0];
                    delete thisCassetteFromYAML.data;
                    copyData[key][cassetteIx] = thisCassetteFromYAML
                }
            // Teistes keeltes kassett kustutatakse
            } else if (key !== `cassettes_${lang}` && key.substring(0, 10) === `cassettes_`) {
                delete copyData[key]
            }

        }
    }
    rueten(copyData, lang)
    let allDataYAML = yaml.safeDump(copyData, { 'noRefs': true, 'indent': '4' })
    const outFile = path.join(fetchDir, `sixfilms.${lang}.yaml`)
    fs.writeFileSync(outFile, allDataYAML, 'utf8')
}