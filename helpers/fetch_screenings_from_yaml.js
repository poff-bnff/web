const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js');

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA_SCREENINGS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Screening']
const STRAPIDATA_FILMS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Film']
const DOMAIN = process.env['DOMAIN'] || 'poff.ee';

const sourceFolder =  path.join(__dirname, '../source/');

const allLanguages = DOMAIN_SPECIFICS.locales[DOMAIN]

for (const lang of allLanguages) {
    LangSelect(lang)
}

function LangSelect(lang) {
    let data = STRAPIDATA_SCREENINGS
    processData(data, lang, CreateYAML);
    console.log(`Fetching ${DOMAIN} screenings ${lang} data`);
}

function processData(data, lang, CreateYAML) {

    const cassettesPath = path.join(fetchDir, `cassettes.${lang}.yaml`)
    const CASSETTES = yaml.safeLoad(fs.readFileSync(cassettesPath, 'utf8'))

    let allData = []
    if (STRAPIDATA_SCREENINGS.length) {
        let screeningsMissingCassetteIDs = []

        for (screeningIx in STRAPIDATA_SCREENINGS) {
            let screening = STRAPIDATA_SCREENINGS[screeningIx]
            let cassetteCarouselPicsCassette = []
            let cassetteCarouselPicsFilms = []
            let cassettePostersCassette = []
            let cassettePostersFilms = []


            if (screening.cassette) {
                let cassetteFromYAML = CASSETTES.filter( (a) => { return screening.cassette.id === a.id})

                if (cassetteFromYAML.length) {
                    STRAPIDATA_SCREENINGS[screeningIx].cassette = JSON.parse(JSON.stringify(cassetteFromYAML[0]))
                }

                let cassette = screening.cassette

                // Cassette carousel pics
                if (cassette.media && cassette.media.stills && cassette.media.stills[0]) {
                    for (const stillIx in cassette.media.stills) {
                        let still = cassette.media.stills[stillIx]
                        if (still.hash && still.ext) {
                            if (still.hash.substring(0, 4) === 'F_1_') {
                                cassetteCarouselPicsCassette.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                            }
                            cassetteCarouselPicsCassette.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                        }
                    }
                }

                if (cassetteCarouselPicsCassette.length > 0) {
                    screening.cassetteCarouselPicsCassette = cassetteCarouselPicsCassette
                }

                // Cassette poster pics
                if (cassette.media && cassette.media.posters && cassette.media.posters[0]) {
                    for (const posterIx in cassette.media.posters) {
                        let poster = cassette.media.posters[posterIx]
                        if (poster.hash && poster.ext) {
                            if (poster.hash.substring(0, 2) === 'P_') {
                                cassettePostersCassette.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                            }
                            cassettePostersCassette.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                        }
                    }
                }

                if (cassettePostersCassette.length > 0) {
                    screening.cassettePostersCassette = cassettePostersCassette
                }


                if(cassette.orderedFilms) {
                    for(filmIx in cassette.orderedFilms) {
                        let film = cassette.orderedFilms[filmIx]
                        if (film && film.film) {
                            let oneFilm = STRAPIDATA_FILMS.filter( (a) => { return film.film.id === a.id })
                            if (typeof oneFilm[0] !== 'undefined') {
                                film.film = JSON.parse(JSON.stringify(oneFilm[0]))
                            }
                            // Film carousel pics
                            if (film.film.media && film.film.media.stills && film.film.media.stills[0]) {
                                for (const stillIx in film.film.media.stills) {
                                    let still = film.film.media.stills[stillIx]
                                    if (still.hash && still.ext) {
                                        if (still.hash.substring(0, 4) === 'F_1_') {
                                            cassetteCarouselPicsFilms.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                                        }
                                        cassetteCarouselPicsFilms.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                                    }
                                }
                            }

                            if (cassetteCarouselPicsFilms.length > 0) {
                                screening.cassetteCarouselPicsFilms = cassetteCarouselPicsFilms
                            }

                            // Film posters pics
                            if (film.film.media && film.film.media.posters && film.film.media.posters[0]) {
                                for (const posterIx in film.film.media.posters) {
                                    let poster = film.film.media.posters[posterIx]
                                    if (poster.hash && poster.ext) {
                                        if (poster.hash.substring(0, 2) === 'P_') {
                                            cassettePostersFilms.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                                        }
                                        cassettePostersFilms.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                                    }
                                }
                            }

                            if (cassettePostersFilms.length > 0) {
                                screening.cassettePostersFilms = cassettePostersFilms
                            }
                        }

                    }
                }
                allData.push(STRAPIDATA_SCREENINGS[screeningIx])

            } else {
                screeningsMissingCassetteIDs.push(screening.id)
            }

        }

        if (screeningsMissingCassetteIDs.length) {
            console.log('Screenings with IDs ', screeningsMissingCassetteIDs.join(', '), ' missing cassette');
        }

    }
    CreateYAML(allData, lang);

}

function CreateYAML(screenings, lang) {

    // console.log(screenings);
    if (lang === DOMAIN_SPECIFICS.defaultLocale[DOMAIN]) {
        const SCREENINGS_YAML_XML_PATH = path.join(fetchDir, `screenings_for_xml.yaml`)

        // // console.log(process.cwd());
        if (screenings.length) {
            let allDataYAML = yaml.safeDump(screenings, { 'noRefs': true, 'indent': '4' });
            fs.writeFileSync(SCREENINGS_YAML_XML_PATH, allDataYAML, 'utf8');
        } else {
            fs.writeFileSync(SCREENINGS_YAML_XML_PATH, '[]', 'utf8');
        }
    }

    const SCREENINGS_YAML_PATH = path.join(fetchDir, `screenings.${lang}.yaml`)

    let screeningsCopy = rueten(JSON.parse(JSON.stringify(screenings)), lang)

    // // console.log(process.cwd());
    let allDataYAML = yaml.safeDump(screeningsCopy, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(SCREENINGS_YAML_PATH, allDataYAML, 'utf8');

}
