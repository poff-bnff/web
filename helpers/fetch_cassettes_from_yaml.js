const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path')
const util = require('util')
const rueten = require('./rueten.js')

const sourceDir = path.join(__dirname, '..', 'source')
const cassetteTemplatesDir = path.join(sourceDir, '_templates', 'cassette_templates')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_PERSONS = STRAPIDATA['Person'];
const STRAPIDATA_PROGRAMMES = STRAPIDATA['Programme'];
const STRAPIDATA_SCREENINGS = STRAPIDATA['Screening'];
const STRAPIDATA_FILMS = STRAPIDATA['Film'];
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const CASSETTELIMIT = parseInt(process.env['CASSETTELIMIT']) || 0

// console.log('LIMIT: ', CASSETTELIMIT);

// Kõik Screening_types name mida soovitakse kasseti juurde lisada, VÄIKETÄHTEDES
const whichScreeningTypesToFetch = ['regular', 'first screening']

const mapping = {
    'poff.ee': 'poff',
    'justfilm.ee': 'justfilm',
    'kinoff.poff.ee': 'kinoff',
    'industry.poff.ee': 'industry',
    'shorts.poff.ee': 'shorts'
}
// STRAPIDATA_PROGRAMMES.map(programme => programme.id)
const modelName = 'Cassette';
const STRAPIDATA_CASSETTE = STRAPIDATA[modelName].filter(cassette => {
    let programme_ids = STRAPIDATA_PROGRAMMES.map(programme => programme.id)
    if (cassette.tags && cassette.tags.programmes) {
        let cassette_programme_ids = cassette.tags.programmes.map(programme => programme.id)
        return cassette_programme_ids.filter(cp_id => programme_ids.includes(cp_id))[0] !== undefined
    } else {
        return false
    }
})

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
    let slugMissingErrorNumber = 0
    let slugMissingErrorIDs = []
    let limit = CASSETTELIMIT
    let counting = 0
    for (const originalElement of STRAPIDATA_CASSETTE) {
        if (limit !== 0 && counting === limit) break;
        const element = JSON.parse(JSON.stringify(originalElement))

        let slugEn = undefined
        if (element.films && element.films.length === 1) {
            slugEn = element.films[0].slug_en
            if (!slugEn) {
                slugEn = element.films[0].slug_et
            }
        }
        if(!slugEn) {
            slugEn = element.slug_en
            if (!slugEn) {
                slugEn = element.slug_et
            }
        }
        counting++

        if(typeof slugEn !== 'undefined') {
            element.dirSlug = slugEn
            element.directory = path.join(dirPath, slugEn)
            fs.mkdirSync(element.directory, { recursive: true })

            let cassetteCarouselPicsCassette = []
            let cassetteCarouselPicsFilms = []
            let cassettePostersCassette = []
            let cassettePostersFilms = []



            // Kasseti programmid
            if (element.tags && element.tags.programmes && element.tags.programmes[0]) {
                for (const programmeIx in element.tags.programmes) {
                    let programme = element.tags.programmes[programmeIx];

                    let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter( (a) => { return programme.id === a.id });
                    if (typeof programmeFromYAML !== 'undefined' && programmeFromYAML[0]) {
                        element.tags.programmes[programmeIx] = JSON.parse(JSON.stringify(programmeFromYAML[0]))
                        // console.log(element.tags.programmes[programmeIx]);
                    }
                }
            }

            // rueten func. is run for each element separately instead of whole data, that is
            // for the purpose of saving slug_en before it will be removed by rueten func.
            rueten(element, lang)

            if(element.films && element.films.length) {
                for (const filmIx in element.films) {
                    let oneFilm = element.films[filmIx]
                    let filmFromYAML = STRAPIDATA_FILMS.filter( (a) => { return oneFilm.id === a.id });
                    if (filmFromYAML !== undefined && filmFromYAML[0]) {
                        element.films[filmIx] = JSON.parse(JSON.stringify(filmFromYAML[0]))
                    }
                }
            }

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
                    // Kui vähemalt üks screeningtype õige, siis hasOneCorrectScreening = true
                    // - st ehitatakse
                    var hasOneCorrectScreening = true

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
                    element.slug = `${element[key]}`;
                }

                if (typeof(element[key]) === 'object' && element[key] != null) {
                    // makeCSV(element[key], element, lang);
                }
            }

            if (element.path === undefined) {
                element.path = `film/${slugEn}`;
                element.slug = slugEn;
            }

            // Cassette carousel pics
            if (element.media && element.media.stills && element.media.stills[0]) {
                for (const stillIx in element.media.stills) {
                    let still = element.media.stills[stillIx]
                    if (still.hash && still.ext) {
                        cassetteCarouselPicsCassette.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                    }
                }
            }

            if (cassetteCarouselPicsCassette.length > 0) {
                element.cassetteCarouselPicsCassette = cassetteCarouselPicsCassette
            }

            // Cassette poster pics
            if (element.media && element.media.posters && element.media.posters[0]) {
                for (const posterIx in element.media.posters) {
                    let poster = element.media.posters[posterIx]
                    if (poster.hash && poster.ext) {
                        cassettePostersCassette.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                    }
                }
            }

            if (cassettePostersCassette.length > 0) {
                element.cassettePostersCassette = cassettePostersCassette
            }

            if (element.films && element.films[0]) {
                for (filmIx in element.films) {
                    let film = element.films[filmIx]
                    let filmSlugEn = film.slug_en

                    if (!filmSlugEn) {
                        filmSlugEn = film.slug
                    }
                    if (typeof filmSlugEn !== 'undefined') {
                        film.dirSlug = filmSlugEn
                    }

                    // Film carousel pics
                    if (film.media && film.media.stills && film.media.stills[0]) {
                        for (const stillIx in film.media.stills) {
                            let still = film.media.stills[stillIx]
                            if (still.hash && still.ext) {
                                if (still.hash.substring(0, 4) === 'F_1_') {
                                    cassetteCarouselPicsFilms.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                                }
                            }
                        }
                    }

                    if (cassetteCarouselPicsFilms.length > 0) {
                        element.cassetteCarouselPicsFilms = cassetteCarouselPicsFilms
                    }

                    // Film posters pics
                    if (film.media && film.media.posters && film.media.posters[0]) {
                        for (const posterIx in film.media.posters) {
                            let poster = film.media.posters[posterIx]
                            if (poster.hash && poster.ext) {
                                    cassettePostersFilms.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                            }
                        }
                    }

                    if (cassettePostersFilms.length > 0) {
                        element.cassettePostersFilms = cassettePostersFilms
                    }

                    // Filmi programmid
                    if (film.tags && film.tags.programmes && film.tags.programmes[0]) {
                        for (const programmeIx in film.tags.programmes) {
                            let programme = film.tags.programmes[programmeIx];
                            let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter( (a) => { return programme.id === a.id });
                            if (typeof programmeFromYAML[0] !== 'undefined') {
                                film.tags.programmes[programmeIx] = JSON.parse(JSON.stringify(programmeFromYAML[0]))
                            } else {
                                console.log('Error! Programme with ID ', programme.id, ', under film with ID ', film.id, ' - domain ', DOMAIN, ' probably not assigned to this programme!');
                            }
                        }
                    }


                    if(film.credentials && film.credentials.rolePerson && film.credentials.rolePerson[0]) {
                        let rolePersonTypes = {}
                        film.credentials.rolePerson.sort(function(a, b){ return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0); })
                        for (roleIx in film.credentials.rolePerson) {
                            let rolePerson = film.credentials.rolePerson[roleIx]
                            if (rolePerson !== undefined) {
                                if (rolePerson.person && rolePerson.person.id) {
                                    let personFromYAML = STRAPIDATA_PERSONS.filter( (a) => { return rolePerson.person.id === a.id });
                                    let personCopy = JSON.parse(JSON.stringify(personFromYAML[0]))
                                    rolePerson.person = rueten(personCopy, lang);

                                    if(typeof rolePersonTypes[rolePerson.role_at_film.roleNamePrivate.toLowerCase()] === 'undefined') {
                                        rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase().replace(' ', '')}`] = []
                                    }
                                    if (rolePerson.person && rolePerson.person.firstName && rolePerson.person.lastName) {
                                        rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase().replace(' ', '')}`].push(`${rolePerson.person.firstName} ${rolePerson.person.lastName}`)
                                    }
                                } else {
                                    // console.log(film.id, ' - ', rolePerson.role_at_film.roleNamePrivate);
                                }
                            }
                            //- - console.log('SEEEE ', rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase()}`], ' - ', rolePerson.role_at_film.roleNamePrivate.toLowerCase(), ' - ', rolePersonTypes)
                        }
                        element.films[filmIx].credentials.rolePersonsByRole = rolePersonTypes
                    }
                }
                rueten(element.films, lang)
            }



            if (hasOneCorrectScreening === true) {
                allData.push(element);
                element.data = dataFrom;
                // console.log(util.inspect(element, {showHidden: false, depth: null}))
                generateYaml(element, lang, copyFile, allData)
            } else {
                console.log('Skipped cassette ', element.id, ' slug ', element.slug,', as none of screening types are ', whichScreeningTypesToFetch.join(', '));
            }

        } else {
            if(showErrors) {
                slugMissingErrorNumber++
                slugMissingErrorIDs.push(element.id)
            }
        }
    }
    if(slugMissingErrorNumber > 0) {
        console.log(`Notification! Value of slug_en or slug_et missing for total of ${slugMissingErrorNumber} cassettes with ID's ${slugMissingErrorIDs.join(', ')}`);
    }
    generateAllDataYAML(allData, lang)
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
                console.log(`ERROR! Template ${cassetteIndexTemplate} missing! Using poff.ee template`);
                fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/cassette_templates/cassette_poff_index_template.pug`)
            }
        }

    }

    // let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    // fs.writeFileSync(path.join(fetchDir, `cassettes2.${lang}.yaml`), allDataYAML, 'utf8')
}

function generateAllDataYAML(allData, lang){
    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(path.join(fetchDir, `cassettes.${lang}.yaml`), allDataYAML, 'utf8')
    console.log('Ready for building are ', allData.length, ' cassettes');
}

fetchAllData();
