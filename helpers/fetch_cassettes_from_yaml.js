const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir = path.join(__dirname, '..', 'source')
const cassetteTemplatesDir = path.join(sourceDir, '_templates', 'cassette_templates')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_PERSONS = STRAPIDATA['Person'];
const STRAPIDATA_PROGRAMMES = STRAPIDATA['Programme'];
const STRAPIDATA_SCREENINGS = STRAPIDATA['Screening'];
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

// Kõik Screening_types name mida soovitakse kasseti juurde lisada, VÄIKETÄHTEDES
const whichScreeningTypesToFetch = ['regular', 'first screening']

const mapping = {
    'poff.ee': 'poff',
    'justfilm.ee': 'justfilm',
    'kinoff.poff.ee': 'kinoff',
    'industry.poff.ee': 'industry',
    'shorts.poff.ee': 'shorts'
}

const modelName = 'Cassette';
const STRAPIDATA_CASSETTE = STRAPIDATA[modelName]

const allLanguages = ["en", "et", "ru"];


function fetchAllData(){
    const cassettesPath = path.join(fetchDir, 'cassettes')
    deleteFolderRecursive(cassettesPath);

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(cassettesPath, "en", 1, 1, {'articles': '/_fetchdir/articles.en.yaml'}, getDataCB);
    getData(cassettesPath, "et", 0, 0, {'articles': '/_fetchdir/articles.et.yaml'}, getDataCB);
    getData(cassettesPath, "ru", 0, 0, {'articles': '/_fetchdir/articles.ru.yaml'}, getDataCB);
}

function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
  };

function getData(dirPath, lang, copyFile, showErrors, dataFrom, getDataCB) {

    fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${DOMAIN} cassettes ${lang} data`);

    getDataCB(dirPath, lang, copyFile, dataFrom, showErrors);
}



function getDataCB(dirPath, lang, copyFile, dataFrom, showErrors) {
    let allData = []
    // data = rueten(data, lang);
    // console.log(data);
    for (const originalElement of STRAPIDATA_CASSETTE) {
        const element = JSON.parse(JSON.stringify(originalElement))
        let slugEn = element.slug_en
        if (!slugEn) {
            slugEn = element.slug_et
        }

        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        if(element.films) {
            var cassetteFilmsBeforeRueten = JSON.parse(JSON.stringify(element.films))
        }

        // Kasseti programmid
        if (element.tags && element.tags.programmes && element.tags.programmes[0]) {
            for (const programmeIx in element.tags.programmes) {
                let programme = element.tags.programmes[programmeIx];
                let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter( (a) => { return programme.id === a.id });
                element.tags.programmes[programmeIx] = programmeFromYAML[0];
            }
        }

        rueten(element, lang)
        if(typeof cassetteFilmsBeforeRueten !== 'undefined') {
            element.films = cassetteFilmsBeforeRueten
        }
        // console.log(element.directory);
        // element = rueten(element, `_${lang}`);

        if(typeof slugEn !== 'undefined') {
            element.dirSlug = slugEn
            element.directory = path.join(dirPath, slugEn)
            fs.mkdirSync(element.directory, { recursive: true })

            // Screenings
            let screenings = []
            for (screeningIx in STRAPIDATA_SCREENINGS) {
                let screening = JSON.parse(JSON.stringify(STRAPIDATA_SCREENINGS[screeningIx]));
                if (screening.cassette && screening.cassette.id === element.id
                    && screening.screening_types && screening.screening_types[0]) {

                    let screeningNames = function(item) {
                        let itemNames = item.name
                        return itemNames
                    }
                    // Kontroll kas screeningtype kassetile lisada, st kas vähemalt üks screening type on whichScreeningTypesToFetch arrays olemas
                    if(!screening.screening_types.map(screeningNames).some(ai => whichScreeningTypesToFetch.includes(ai.toLowerCase()))) {
                        continue
                    }

                    delete screening.cassette;
                    screenings.push(rueten(screening, lang))
                }
            }

            if (screenings.length > 0) {
                element.screenings = screenings
            }

            // let element = JSON.parse(JSON.stringify(element));
            // let aliases = []
            let languageKeys = ['en', 'et', 'ru'];
            for (key in element) {

                if (key == 'slug') {
                    element.path = `film/${element[key]}`;
                }

                if (typeof(element[key]) === 'object' && element[key] != null) {
                    // makeCSV(element[key], element, lang);
                }
            }

            if (element.films && element.films[0]) {
                for (filmIx in element.films) {
                    let film = element.films[filmIx]
                    let filmSlugEn = film.slug_en
                    if (!filmSlugEn) {
                        filmSlugEn = film.slug_et
                    }
                    rueten(film, lang)
                    if (typeof filmSlugEn !== 'undefined') {
                        film.dirSlug = filmSlugEn
                    }


                    // Filmi programmid
                    if (film.tags && film.tags.programmes && film.tags.programmes[0]) {
                        for (const programmeIx in film.tags.programmes) {
                            let programme = film.tags.programmes[programmeIx];
                            let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter( (a) => { return programme.id === a.id });
                            film.tags.programmes[programmeIx] = programmeFromYAML[0];
                        }
                    }


                    if(film.credentials && film.credentials.rolePerson && film.credentials.rolePerson[0]) {
                        let rolePersonTypes = {}
                        film.credentials.rolePerson.sort(function(a, b){ return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0); })
                        for (roleIx in film.credentials.rolePerson) {
                            let rolePerson = film.credentials.rolePerson[roleIx]

                            let personFromYAML = STRAPIDATA_PERSONS.filter( (a) => { return rolePerson.person.id === a.id });
                            rolePerson.person = rueten(personFromYAML[0], lang);

                            if(typeof rolePersonTypes[rolePerson.role_at_film.roleNamePrivate.toLowerCase()] === 'undefined') {
                                rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase()}`] = []
                            }
                            if (rolePerson.person && rolePerson.person.firstName && rolePerson.person.lastName) {
                                rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase()}`].push(`${rolePerson.person.firstName} ${rolePerson.person.lastName}`)
                            }
                            //- - console.log('SEEEE ', rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase()}`], ' - ', rolePerson.role_at_film.roleNamePrivate.toLowerCase(), ' - ', rolePersonTypes)
                        }
                        element.films[filmIx].credentials.rolePersonsByRole = rolePersonTypes
                    }
                }
            }




            allData.push(element);
            element.data = dataFrom;

            generateYaml(element, lang, copyFile, allData)

        } else {
            if(showErrors) {
                console.log(`- Notification! Cassette ID ${element.id} slug_en or slug_et value missing`);
            }
        }
    }
}

function generateYaml(element, lang, copyFile, allData){
    let yamlStr = yaml.safeDump(element, { 'noRefs': true, 'indent': '4' });

    // console.log(element.directory)

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');

    if (copyFile) {

        if (mapping[DOMAIN]) {
            let cassetteIndexTemplate = path.join(cassetteTemplatesDir, `cassette_${mapping[DOMAIN]}_index_template.pug`);
            if (fs.existsSync(cassetteIndexTemplate)) {
                fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/cassette_templates/cassette_${mapping[DOMAIN]}_index_template.pug`)
            } else {
                console.log(`ERROR! Default template ${cassetteIndexTemplate} missing!`);
            }
        }

    }

    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });

    fs.writeFileSync(path.join(fetchDir, `cassettes.${lang}.yaml`), allDataYAML, 'utf8')
}


fetchAllData();
