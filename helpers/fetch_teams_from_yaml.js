const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js');

const sourceDir =  path.join(__dirname, '..', 'source');
const fetchDir =  path.join(sourceDir, '_fetchdir');
const fetchJuriesDir =  path.join(fetchDir, 'juries');
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml');
const STRAPIDATA_TEAM = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Team'];
const STRAPIDATA_PERSONS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Person'];
const DOMAIN = process.env['DOMAIN'] || 'poff.ee';

const languages = ['en', 'et', 'ru']
for (const ix in languages) {
    const lang = languages[ix];
    console.log(`Fetching ${DOMAIN} teams and juries ${lang} data`);

    allData = []
    for (const ix in STRAPIDATA_TEAM) {
        let element = STRAPIDATA_TEAM[ix];

        for (const subTeamIx in element.subTeam) {
            let subTeam = element.subTeam[subTeamIx];
            for (const juryMemberIx in subTeam.juryMember) {
                let juryMember = subTeam.juryMember[juryMemberIx];
                let personFromYAML = STRAPIDATA_PERSONS.filter( (a) => { return juryMember.person.id === a.id });
                let isJury = true;
                juryMember.person = personFromYAML[0];
            }
        }
        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);
        element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'};

        // if (isJury) {
        //     const oneJuryYAML = yaml.safeDump(element, { 'noRefs': true, 'indent': '4' });
        //     const yamlJuriesPath = path.join(fetchJuriesDir, `teams.${lang}.yaml`);
        //     fs.writeFileSync(yamlJuriesPath, oneJuryYAML, 'utf8');
        // } else {
            allData.push(element);
        // }

        const allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
        const yamlPath = path.join(fetchDir, `teams.${lang}.yaml`);
        fs.writeFileSync(yamlPath, allDataYAML, 'utf8');
    }
}
