const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const util = require('util')
const rueten = require('./rueten.js')

const sourceDir = path.join(__dirname, '..', 'source')
const cassetteTemplatesDir = path.join(sourceDir, '_templates', 'cassette_templates')
const fetchDir = path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_PERSONS = STRAPIDATA['Person']
const STRAPIDATA_PROGRAMMES = STRAPIDATA['Programme']
const STRAPIDATA_FE = STRAPIDATA['FestivalEdition']
const STRAPIDATA_SCREENINGS = STRAPIDATA['Screening']
const STRAPIDATA_FILMS = STRAPIDATA['Film']
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const CASSETTELIMIT = parseInt(process.env['CASSETTELIMIT']) || 0
// true = check if programme is for this domain / false = check if festival edition is for this domain
const CHECKPROGRAMMES = false

// console.log('LIMIT: ', CASSETTELIMIT)

// Kõik Screening_types name mida soovitakse kasseti juurde lisada, VÄIKETÄHTEDES
const whichScreeningTypesToFetch = ['first screening']

const mapping = {
    'poff.ee': 'poff',
    'justfilm.ee': 'justfilm',
    'kinoff.poff.ee': 'kinoff',
    'industry.poff.ee': 'industry',
    'shorts.poff.ee': 'shorts'
}
// STRAPIDATA_PROGRAMMES.map(programme => programme.id)
const modelName = 'Cassette'

if(CHECKPROGRAMMES) {

    let cassettesWithOutProgrammes = []
    var STRAPIDATA_CASSETTE = STRAPIDATA[modelName].filter(cassette => {
        let programme_ids = STRAPIDATA_PROGRAMMES.map(programme => programme.id)
        if (cassette.tags && cassette.tags.programmes) {
            let cassette_programme_ids = cassette.tags.programmes.map(programme => programme.id)
            return cassette_programme_ids.filter(cp_id => programme_ids.includes(cp_id))[0] !== undefined
        } else {
            cassettesWithOutProgrammes.push(cassette.id)
            return false
        }
    })
    if (cassettesWithOutProgrammes.length) {
        console.log('Cassettes with IDs', cassettesWithOutProgrammes.join(', '), ' have no programmes')
    }

} else if (!CHECKPROGRAMMES && DOMAIN !== 'poff.ee') {

    let cassettesWithOutFestivalEditions = []

    var STRAPIDATA_CASSETTE = STRAPIDATA[modelName].filter(cassette => {
        let festival_editions = STRAPIDATA_FE.map(edition => edition.id)
        if (cassette.festival_editions && cassette.festival_editions.length) {
            let cassette_festival_editions_ids = cassette.festival_editions.map(edition => edition.id)
            return cassette_festival_editions_ids.filter(cfe_id => festival_editions.includes(cfe_id))[0] !== undefined
        } else {
            cassettesWithOutFestivalEditions.push(cassette.id)
            return false
        }
    })
    if (cassettesWithOutFestivalEditions.length) {
        console.log('Cassettes with IDs', cassettesWithOutProgrammes.join(', '), ' have no festival editions')
    }

} else {
    var STRAPIDATA_CASSETTE = STRAPIDATA[modelName]
}

const allLanguages = ["en", "et", "ru"]


function fetchAllData(){
    const cassettesPath = path.join(fetchDir, 'cassettes')
    deleteFolderRecursive(cassettesPath)

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(cassettesPath, "en", 1, 1, {'articles': '/_fetchdir/articles.en.yaml'}, getDataCB)
    getData(cassettesPath, "et", 0, 0, {'articles': '/_fetchdir/articles.et.yaml'}, getDataCB)
    getData(cassettesPath, "ru", 0, 0, {'articles': '/_fetchdir/articles.ru.yaml'}, getDataCB)
}

function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath)
            } else { // delete file
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
  }

function getData(dirPath, lang, copyFile, showErrors, dataFrom, getDataCB) {

    fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${DOMAIN} cassettes ${lang} data`)

    getDataCB(dirPath, lang, copyFile, dataFrom, showErrors)
}

function JSONcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function getDataCB(dirPath, lang, copyFile, dataFrom, showErrors) {
    let allData = []
    // data = rueten(data, lang)
    // console.log(data)
    let slugMissingErrorNumber = 0
    let slugMissingErrorIDs = []
    let limit = CASSETTELIMIT
    let counting = 0
    for (const s_cassette of STRAPIDATA_CASSETTE) {
        if (limit !== 0 && counting === limit) break
        counting++

        const s_cassette_copy = JSONcopy(s_cassette)

        let slugEn = undefined
        if (s_cassette_copy.films && s_cassette_copy.films.length === 1) {
            slugEn = s_cassette_copy.films[0].slug_en
            if (!slugEn) {
                slugEn = s_cassette_copy.films[0].slug_et
            }
        }
        if(!slugEn) {
            slugEn = s_cassette_copy.slug_en
            if (!slugEn) {
                slugEn = s_cassette_copy.slug_et
            }
        }

        if(typeof slugEn !== 'undefined') {
            s_cassette_copy.dirSlug = slugEn
            s_cassette_copy.directory = path.join(dirPath, slugEn)
            fs.mkdirSync(s_cassette_copy.directory, { recursive: true })

            let cassetteCarouselPicsCassette = []
            let cassetteCarouselPicsFilms = []
            let cassettePostersCassette = []
            let cassettePostersFilms = []

            // Kasseti programmid
            if (s_cassette_copy.tags && s_cassette_copy.tags.programmes && s_cassette_copy.tags.programmes[0]) {
                for (const programmeIx in s_cassette_copy.tags.programmes) {
                    let programme = s_cassette_copy.tags.programmes[programmeIx]
                    let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter( (a) => { return programme.id === a.id })
                    if (typeof programmeFromYAML !== 'undefined' && programmeFromYAML[0]) {
                        s_cassette_copy.tags.programmes[programmeIx] = JSONcopy(programmeFromYAML[0])
                    }
                }
            }

            // rueten func. is run for each s_cassette_copy separately instead of whole data, that is
            // for the purpose of saving slug_en before it will be removed by rueten func.
            rueten(s_cassette_copy, lang)

            if(s_cassette_copy.films && s_cassette_copy.films.length) {
                for (const filmIx in s_cassette_copy.films) {
                    let oneFilm = s_cassette_copy.films[filmIx]
                    let s_film = STRAPIDATA_FILMS.filter( (a) => { return oneFilm.id === a.id })
                    if (s_film !== undefined && s_film[0]) {
                        s_cassette_copy.films[filmIx] = JSONcopy(s_film[0])
                    }
                }
            }

            // #379 put ordered films to cassette.film
            let ordered_films = s_cassette_copy.orderedFilms.map(s_c_film => {
                let s_films = STRAPIDATA_FILMS.filter( (s_film) => { return s_c_film.film.id === s_film.id } )
                if (s_films && s_films[0]) {
                    s_films[0].ordinal = s_c_film.order
                    return s_films[0]
                } else {
                    return null
                }
            })
            if (ordered_films !== undefined && ordered_films[0]) {
                s_cassette_copy.films = JSON.parse(JSON.stringify(ordered_films))
            }

            // Screenings
            let screenings = []
            for (screeningIx in STRAPIDATA_SCREENINGS) {
                let screening = JSONcopy(STRAPIDATA_SCREENINGS[screeningIx])
                if (screening.cassette && screening.cassette.id === s_cassette_copy.id
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

                    delete screening.cassette
                    screenings.push(rueten(screening, lang))
                }
            }

            if (screenings.length > 0) {
                s_cassette_copy.screenings = screenings
            }

            // let s_cassette_copy = JSONcopy(s_cassette_copy))
            // let aliases = []
            let languageKeys = ['en', 'et', 'ru']
            for (key in s_cassette_copy) {
                if (key == 'slug') {
                    s_cassette_copy.path = `film/${s_cassette_copy[key]}`
                    s_cassette_copy.slug = `${s_cassette_copy[key]}`
                }

                if (typeof(s_cassette_copy[key]) === 'object' && s_cassette_copy[key] != null) {
                    // makeCSV(s_cassette_copy[key], s_cassette_copy, lang)
                }
            }

            if (s_cassette_copy.path === undefined) {
                s_cassette_copy.path = `film/${slugEn}`
                s_cassette_copy.slug = slugEn
            }

            // Cassette carousel pics
            if (s_cassette_copy.media && s_cassette_copy.media.stills && s_cassette_copy.media.stills[0]) {
                for (const stillIx in s_cassette_copy.media.stills) {
                    let still = s_cassette_copy.media.stills[stillIx]
                    if (still.hash && still.ext) {
                        if (still.hash.substring(0, 4) === 'F_1_') {
                            cassetteCarouselPicsCassette.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                        }
                        cassetteCarouselPicsCassette.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                    }
                }
            }

            if (cassetteCarouselPicsCassette.length > 0) {
                s_cassette_copy.cassetteCarouselPicsCassette = cassetteCarouselPicsCassette
            }

            // Cassette poster pics
            if (s_cassette_copy.media && s_cassette_copy.media.posters && s_cassette_copy.media.posters[0]) {
                for (const posterIx in s_cassette_copy.media.posters) {
                    let poster = s_cassette_copy.media.posters[posterIx]
                    if (poster.hash && poster.ext) {
                        if (poster.hash.substring(0, 2) === 'P_') {
                            cassettePostersCassette.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                        }
                        cassettePostersCassette.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                    }
                }
            }

            if (cassettePostersCassette.length > 0) {
                s_cassette_copy.cassettePostersCassette = cassettePostersCassette
            }

            if (s_cassette_copy.films && s_cassette_copy.films[0]) {
                for (scc_film of s_cassette_copy.films) {
                    let filmSlugEn = scc_film.slug_en

                    if (!filmSlugEn) {
                        filmSlugEn = scc_film.slug
                    }
                    if (typeof filmSlugEn !== 'undefined') {
                        scc_film.dirSlug = filmSlugEn
                    }

                    // Film carousel pics
                    if (scc_film.media && scc_film.media.stills && scc_film.media.stills[0]) {
                        for (still of scc_film.media.stills) {
                            if (still.hash && still.ext) {
                                if (still.hash.substring(0, 4) === 'F_1_') {
                                    cassetteCarouselPicsFilms.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                                }
                                cassetteCarouselPicsFilms.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                            }
                        }
                    }

                    if (cassetteCarouselPicsFilms.length > 0) {
                        s_cassette_copy.cassetteCarouselPicsFilms = cassetteCarouselPicsFilms
                    }

                    // Film posters pics
                    if (scc_film.media && scc_film.media.posters && scc_film.media.posters[0]) {
                        for (poster of scc_film.media.posters) {
                            if (poster.hash && poster.ext) {
                                if (poster.hash.substring(0, 2) === 'P_') {
                                    cassettePostersFilms.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                                }
                                cassettePostersFilms.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                            }
                        }
                    }

                    if (cassettePostersFilms.length > 0) {
                        s_cassette_copy.cassettePostersFilms = cassettePostersFilms
                    }

                    // Filmi treiler
                    if (scc_film.media && scc_film.media.trailer && scc_film.media.trailer[0]) {
                        for (trailer of scc_film.media.trailer) {
                            if(trailer.url && trailer.url.length > 10) {
                                let splitYouTubeLink = trailer.url.split("=")[1]
                                let splitForVideoCode = splitYouTubeLink.split("&")[0]
                                if (splitForVideoCode.length === 11) {
                                    trailer.youTubeCode = splitForVideoCode
                                }
                            }
                        }
                    }

                    // Filmi programmid
                    if (scc_film.tags && scc_film.tags.programmes && scc_film.tags.programmes[0]) {
                        for (const programmeIx in scc_film.tags.programmes) {
                            let programme = scc_film.tags.programmes[programmeIx]
                            let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter( (a) => { return programme.id === a.id })
                            if (typeof programmeFromYAML[0] !== 'undefined') {
                                scc_film.tags.programmes[programmeIx] = JSONcopy(programmeFromYAML[0])
                            } else {
                                console.log('Error! Programme with ID ', programme.id, ', under film with ID ', scc_film.id, ' - domain ', DOMAIN, ' probably not assigned to this programme!')
                            }
                        }
                    }

                    if(scc_film.credentials && scc_film.credentials.rolePerson && scc_film.credentials.rolePerson[0]) {
                        let rolePersonTypes = {}
                        scc_film.credentials.rolePerson.sort(function(a, b){ return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0) })
                        for (roleIx in scc_film.credentials.rolePerson) {
                            let rolePerson = scc_film.credentials.rolePerson[roleIx]
                            if (rolePerson !== undefined) {
                                if (rolePerson.person && rolePerson.person.id) {
                                    let personFromYAML = STRAPIDATA_PERSONS.filter( (a) => { return rolePerson.person.id === a.id })
                                    let personCopy = JSONcopy(personFromYAML[0])
                                    let searchRegExp = new RegExp(' ', 'g')

                                    rolePerson.person = rueten(personCopy, lang)

                                    if(typeof rolePersonTypes[rolePerson.role_at_film.roleNamePrivate.toLowerCase()] === 'undefined') {
                                        rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase().replace(searchRegExp, '')}`] = []
                                    }
                                    if (rolePerson.person) {
                                        let fullName = undefined
                                        if (rolePerson.person.firstName) {
                                            fullName = rolePerson.person.firstName
                                        }
                                        if (rolePerson.person.lastName) {
                                            fullName = `${fullName !== undefined ? fullName : ''} ${rolePerson.person.lastName}`
                                        }

                                        if (fullName !== undefined && fullName.length > 2) {
                                            rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase().replace(searchRegExp, '')}`].push(fullName.trim())
                                        }
                                    }
                                } else {
                                    // console.log(film.id, ' - ', rolePerson.role_at_film.roleNamePrivate)
                                }
                            }
                            //- - console.log('SEEEE ', rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase()}`], ' - ', rolePerson.role_at_film.roleNamePrivate.toLowerCase(), ' - ', rolePersonTypes)
                        }
                        scc_film.credentials.rolePersonsByRole = rolePersonTypes
                    }
                }
                rueten(s_cassette_copy.films, lang)
            }



            if (hasOneCorrectScreening === true) {
                allData.push(s_cassette_copy)
                s_cassette_copy.data = dataFrom
                // console.log(util.inspect(s_cassette_copy, {showHidden: false, depth: null}))
                generateYaml(s_cassette_copy, lang, copyFile, allData)
            } else {
                console.log('Skipped cassette ', s_cassette_copy.id, ' slug ', s_cassette_copy.slug,', as none of screening types are ', whichScreeningTypesToFetch.join(', '))
            }

        } else {
            if(showErrors) {
                slugMissingErrorNumber++
                slugMissingErrorIDs.push(s_cassette_copy.id)
            }
        }
    }
    if(slugMissingErrorNumber > 0) {
        console.log(`Notification! Value of slug_en or slug_et missing for total of ${slugMissingErrorNumber} cassettes with ID's ${slugMissingErrorIDs.join(', ')}`)
    }
    generateAllDataYAML(allData, lang)
}

function generateYaml(element, lang, copyFile, allData){
    let yamlStr = yaml.safeDump(element, { 'noRefs': true, 'indent': '4' })

    // console.log(element.directory)

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8')

    if (copyFile) {

        if (mapping[DOMAIN]) {
            let cassetteIndexTemplate = path.join(cassetteTemplatesDir, `cassette_${mapping[DOMAIN]}_index_template.pug`)
            if (fs.existsSync(cassetteIndexTemplate)) {
                fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/cassette_templates/cassette_${mapping[DOMAIN]}_index_template.pug`)
            } else {
                console.log(`ERROR! Template ${cassetteIndexTemplate} missing! Using poff.ee template`)
                fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/cassette_templates/cassette_poff_index_template.pug`)
            }
        }

    }

    // let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
    // fs.writeFileSync(path.join(fetchDir, `cassettes2.${lang}.yaml`), allDataYAML, 'utf8')
}

function generateAllDataYAML(allData, lang){
    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(path.join(fetchDir, `cassettes.${lang}.yaml`), allDataYAML, 'utf8')
    console.log('Ready for building are ', allData.length, ' cassettes')
}

fetchAllData()
