const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const h2p = require('html2plaintext')
console.log(h2p('J&uuml;rgen ja Rasmus'));

const { strapiQuery } = require("../../helpers/strapiQuery.js")


const FILMS_FN = path.join(__dirname, '../dynamic/films.yaml')
const EVENTIVAL_FILMS = yaml.safeLoad(fs.readFileSync(FILMS_FN))

var TOKEN = ''
const STRAPI_URL = 'http://139.59.130.149'
const FILMS_API = `${STRAPI_URL}/films`
const CASSETTES_API = `${STRAPI_URL}/cassettes`

const sourceDir =  path.join(__dirname, '..', '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))


const E_FILMS = (EVENTIVAL_FILMS.map(film => {
    let film_out = {
        remoteId: (film.ids ? film.ids : {'system_id': ''}).system_id.toString(),
        title_et: h2p((film.titles ? film.titles : {'title_local': ''}).title_local),
        title_en: h2p((film.titles ? film.titles : {'title_english': ''}).title_english),
        title_ru: h2p((film.titles ? film.titles : {'title_custom': ''}).title_custom),
        titleOriginal: h2p((film.titles ? film.titles : {'title_original': ''}).title_original),
        // year: film.film_info.completion_date.year.toString(),
        // runtime: (film.film_info.runtime.seconds / 60).toString(),
        // festival_edition: film.eventival_categorization.categories.category,
        // otherFestivals: '?',
        // tags: {
        //     premiere_types: '?',
        //     genres: film.film_info.types.type,
        //     keywords: film.eventival_categorization.tags.tag,
        //     programmes: {
        //         id: film.eventival_categorization.sections.section.id
        //     }
        // },
        // countriesAndLanguages: {
        //     countries: {
        //         id: film.film_info.countries.country.code
        //     },
        //     languages: {
        //         id: film.film_info.languages.language.code
        //     }
        // },
        // subtitles: {
        //     id: film.film_info.subtitle_languages.subtitle_language.code
        // },
        // credentials: {
        //     rolePerson: {
        //         role_at_film: {
        //             id: film.publications.en //....
        //         },
        //         person: {
        //             id: '?'
        //         }
        //     },
        //     roleCompany: {
        //         role_at_film: {
        //             id: '?'
        //         },
        //         person: {
        //             id : '?'
        //         }
        //     }
        // },
        // presentedBy: {
        //     presentedBText: {
        //         et: '?',
        //         en: '?',
        //         ru: '?'
        //     },
        //     organisations: {
        //         id: '?'
        //     }
        // },
        // world_sales: '?'
    }

    if (film.publications) {
        const publications = film.publications
        for (const [lang, publication] of Object.entries(publications)) {
            if ('synopsis_long' in publication) {
                if (film_out['synopsis'] === undefined) {
                    film_out['synopsis'] = {}
                }
                film_out['synopsis'][lang] = h2p(publication.synopsis_long.__cdata)
            }
        }
    }

    return film_out
}))

const E_CASSETTES = (EVENTIVAL_FILMS.map(e_film => {
    const strapiFilm = STRAPIDATA.Film.filter((s_film) => {
        return s_film.remoteId === e_film.ids.system_id.toString()
    })
    let c_films = []
    if (strapiFilm.length) {
        c_films.push({id: strapiFilm[0].id.toString()})
    }
    let cassette_out = {
        remoteId: (e_film.ids ? e_film.ids : {'system_id': ''}).system_id.toString(),
        title_et: h2p((e_film.titles ? e_film.titles : {'title_local': ''}).title_local),
        title_en: h2p((e_film.titles ? e_film.titles : {'title_english': ''}).title_english),
        title_ru: h2p((e_film.titles ? e_film.titles : {'title_custom': ''}).title_custom),
        // festival_edition: e_film.eventival_categorization.categories.category,
        // tags: {
        //     premiere_types: '?',
        //     genres: e_film.film_info.types.type,
        //     keywords: e_film.eventival_categorization.tags.tag,
        //     programmes: {
        //         id: e_film.eventival_categorization.sections.section.id
        //     }
        // },
        // presenters: [{
        //     id: '0'
        // }],
        films: c_films
    }
    if (e_film.publications) {
        const publications = e_film.publications
        for (const [lang, publication] of Object.entries(publications)) {
            if ('synopsis_long' in publication) {
                if (cassette_out['synopsis'] === undefined) {
                    cassette_out['synopsis'] = {}
                }
                cassette_out['synopsis'][lang] = h2p(publication.synopsis_long.__cdata)
            }
        }
    }

    return cassette_out
}))


async function submitFilm(e_film) {
    let options = {
        headers: { 'Content-Type': 'application/json' }
    }

    const strapiFilm = STRAPIDATA.Film.filter((film) => {
        return film.remoteId === e_film.remoteId
    })

    if (strapiFilm.length) {
        e_film['id'] = strapiFilm[0].id
        options.path = FILMS_API + '/' + e_film.id
        options.method = 'PUT'
    } else {
        options.path = FILMS_API
        options.method = 'POST'
    }
    const film_from_strapi = await strapiQuery(options, e_film)
    return film_from_strapi
}


const submitFilms = async () => {
    let from_strapi = []
    for (const ix in E_FILMS) {
        // if (ix > 5) { continue }
        const film_from_strapi = await submitFilm(E_FILMS[ix])
        from_strapi.push(film_from_strapi)
    }
    return from_strapi
}


async function submitCassette(e_cassette) {
    let options = {
        headers: { 'Content-Type': 'application/json' }
    }

    const strapiCassette = STRAPIDATA.Cassette.filter((cassette) => {
        return cassette.remoteId === e_cassette.remoteId
    })

    if (strapiCassette.length) {
        e_cassette['id'] = strapiCassette[0].id
        options.path = CASSETTES_API + '/' + e_cassette.id
        options.method = 'PUT'
    } else {
        options.path = CASSETTES_API
        options.method = 'POST'
    }
    const cassette_from_strapi = await strapiQuery(options, e_cassette)
    return cassette_from_strapi
}

const submitCassettes = async () => {
    let from_strapi = []
    for (const ix in E_CASSETTES) {
        // if (ix > 5) { continue }
        const cassette_from_strapi = await submitCassette(E_CASSETTES[ix])
        from_strapi.push(cassette_from_strapi)
    }
    return from_strapi
}

const main = async () => {
    // await submitFilms()
    await submitCassettes()
}

main()

