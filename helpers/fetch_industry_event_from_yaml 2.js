const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js');

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const sourceDir =  path.join(rootDir, 'source');
const fetchDir =  path.join(sourceDir, '_fetchdir');
const fetchDataDir =  path.join(fetchDir, 'industryevents');
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml');
const STRAPIDATA_INDUSTRY_EVENT = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['IndustryEvent'];
const DOMAIN = process.env['DOMAIN'] || 'poff.ee';

const mapping = DOMAIN_SPECIFICS.domain
const allLanguages = DOMAIN_SPECIFICS.locales[DOMAIN]

for (const lang of allLanguages) {
    console.log(`Fetching ${DOMAIN} Industry Event ${lang} data`);

    var allData = []
    for (const ix in STRAPIDATA_INDUSTRY_EVENT) {


        let element = JSON.parse(JSON.stringify(STRAPIDATA_INDUSTRY_EVENT[ix]));

        if (element[`slug_${lang}`]) {
            let dirSlug = element[`slug_${lang}`]
            element.path = `events/${dirSlug}`
            element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'};
            const oneYaml = yaml.safeDump(rueten(element, lang), { 'noRefs': true, 'indent': '4' });
            const yamlPath = path.join(fetchDataDir, dirSlug, `data.${lang}.yaml`);

            let saveDir = path.join(fetchDataDir, dirSlug);
            fs.mkdirSync(saveDir, { recursive: true });

            fs.writeFileSync(yamlPath, oneYaml, 'utf8');
            fs.writeFileSync(`${saveDir}/index.pug`, `include /_templates/industry_event_index_template.pug`)


            element = rueten(element, lang);
            allData.push(element)
        }
    }

    let dataToYAML = allData || []
    const allDataYAML = yaml.safeDump(dataToYAML, { 'noRefs': true, 'indent': '4' });
    const yamlPath = path.join(fetchDir, `industryevents.${lang}.yaml`);
    fs.writeFileSync(yamlPath, allDataYAML, 'utf8');
    // console.log(allData);
}
