const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const modelName = 'Footer'
const STRAPIDATA_FOOTER = STRAPIDATA[modelName]

const languages = ['en', 'et', 'ru']

for (const lang of languages) {

    console.log(`Fetching ${process.env['DOMAIN']} footer ${lang} data`)

    let copyData = JSON.parse(JSON.stringify(STRAPIDATA_FOOTER))
    // console.log(util.inspect(copyData));
    let buffer = [];
    for (index in copyData) {
        // console.log('index', index);
        // console.log('domain', domain);
        // console.log('copydatadomeen', copyData[index].domain);
        if(copyData[index].domain.url === DOMAIN) {
            buffer = rueten(copyData[index], lang)
        }
    }

    const globalDataPath = path.join(sourceDir, `global.${lang}.yaml`)
    // console.log(buffer);
    let globalData= yaml.safeLoad(fs.readFileSync(globalDataPath, 'utf8'))
    // console.log(globalData);
    globalData.footer = buffer

    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(globalDataPath, allDataYAML, 'utf8')
}


