const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const mapping = {
    'poff.ee': 'POFFiFooter',
    'justfilm.ee': 'JustFilmFooter',
    'kinoff.poff.ee': 'KinoffiFooter',
    'industry.poff.ee': 'IndustryFooter',
    'shorts.poff.ee': 'ShortsiFooter'
}
const STRAPIDATA_FOOTER = STRAPIDATA[mapping[DOMAIN]]

LangSelect('et');
LangSelect('en');
LangSelect('ru');

function LangSelect(lang) {
    processData(lang, CreateYAML);
    console.log(`Fetching ${process.env['DOMAIN']} footer ${lang} data`);
}


function processData(lang, CreateYAML) {
    // console.log(util.inspect(data));


    let copyData = JSON.parse(JSON.stringify(STRAPIDATA_FOOTER));
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
    CreateYAML(buffer, lang);
    // console.log('COPYDATA', copyData.keys());
    // console.log('BUFFER', buffer);
}

function CreateYAML(buffer, lang) {
    const globalDataPath = path.join(sourceDir, `global.${lang}.yaml`)
    // console.log(buffer);
    let globalData= yaml.safeLoad(fs.readFileSync(globalDataPath, 'utf8'))
    // console.log(globalData);
    globalData.footer = buffer

    let allDataYAML = yaml.safeDump(globalData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(globalDataPath, allDataYAML, 'utf8')
}


