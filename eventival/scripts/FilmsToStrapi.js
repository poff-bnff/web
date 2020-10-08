const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const { strapiQuery } = require("../../helpers/strapiQuery.js")


const FILMS_FN = path.join(__dirname, '../dynamic/films.yaml')
const EVENTIVAL_FILMS = yaml.safeLoad(fs.readFileSync(FILMS_FN))

var TOKEN = ''
const STRAPI_URL = 'http://139.59.130.149'
const FILMS_API = `${STRAPI_URL}/films`
const CASSETTES_API = `${STRAPI_URL}/cassettes`


const E_FILMS = (EVENTIVAL_FILMS.map(film => {
    let film_out = {
        filmId: film.ids.system_id.toString(),
        title_et: film.titles.title_local,
        title_en: film.titles.title_english,
        title_ru: film.titles.title_custom,
        titleOriginal: film.titles.title_original,
        year: film_info.completion_date.year,
        runtime: (film.film_info.runtime.seconds / 60).toString(),
        festival_edition: film.eventival_categorization.categories.category,
        otherFestivals: '?',
        synopsis: {
            et: film.publications.et.synopsis_long,
            en: film.publications.en.synopsis_long,
            ru: film.publications.ru.synopsis_long
        },
        tags: {
            premiere_types: '?',
            genres: film.film_info.types.type,
            keywords: film.eventival_categorization.tags.tag,
            programmes: {
                id: film.eventival_categorization.sections.section.id
            }
        },
        countriesAndLanguages: {
            countries: {
                id: film.film_info.countries.country.code
            },
            languages: {
                id: film.film_info.languages.language.code
            }
        },
        subtitles: {
            id: film.film_info.subtitle_languages.subtitle_language.code
        },
        credentials: {
            rolePerson: {
                role_at_film: {
                    id: film.publications.en //....
                },
                person: {
                    id: '?'
                }
            },
            roleCompany: {
                role_at_film: {
                    id: '?'
                },
                person: {
                    id : '?'
                }
            }
        },
        presentedBy: {
            presentedBText: {
                et: '?',
                en: '?',
                ru: '?'
            },
            organisations: {
                id: '?'
            }
        },
        world_sales: '?'
    }

    if (film.publications) {
        const publications = film.publications
        for (const [lang, publication] of Object.entries(publications)) {
            if ('synopsis_long' in publication) {
                if (film_out['synopsis'] === undefined) {
                    film_out['synopsis'] = {}
                }
                film_out['synopsis'][lang] = publication.synopsis_long
            }
        }
    }

    return film_out
}))

const E_CASSETTES = (EVENTIVAL_FILMS.map(film => {
    let cassette_out = {
        remoteId: film.ids.system_id.toString(),
        title_et: film.titles.title_local,
        title_en: film.titles.title_english,
        title_ru: film.titles.title_custom,
        synopsis: {
            et: film.publications.et.synopsis_long,
            en: film.publications.en.synopsis_long,
            ru: film.publications.ru.synopsis_long
        },
        festival_edition: film.eventival_categorization.categories.category,
        tags: {
            premiere_types: '?',
            genres: film.film_info.types.type,
            keywords: film.eventival_categorization.tags.tag,
            programmes: {
                id: film.eventival_categorization.sections.section.id
            }
        },
        slug_et: '?',
        slug_en: '?',
        slug_ru: '?',
        presenters: {
            id: '?'
        },
        films: {
            id: '?'
        }
    }

    return cassette_out
}))




const submitFilms = async () => {

    for (const ix in E_FILMS) {
        if (ix > 5) {
            continue
        }
        const e_film = E_FILMS[ix];
        const api = FILMS_API + '?remoteId=' + e_film.remoteId
        let options = {
            host: process.env['StrapiHost'],
            path: api,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + TOKEN
            }
        }
        const strapiFilm = await strapiQuery(options)
        let from_strapi = {}

        if(strapiFilm.length) {
            e_film['id'] = strapiFilm[0].id
            options.path = FILMS_API + '/' + e_film.id
            options.method = 'PUT'

            from_strapi = await strapiQuery(options, e_film)
        } else {
            options.path = FILMS_API
            options.method = 'POST'

            from_strapi = await strapiQuery(options, e_film)
        }
        // console.log(from_strapi)
    }
}


async function submitCassette(e_cassette) {
    const api = CASSETTES_API + '?remoteId=' + e_cassette.remoteId
    let options = {
        host: process.env['StrapiHost'],
        path: api,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }
    const strapiCassette = await strapiQuery(options)

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
        if (ix > 5) {
            continue
        }
        const cassette_from_strapi = await submitCassette(E_CASSETTES[ix])
        from_strapi.push(cassette_from_strapi)
    }
    return from_strapi
}

const main = async () => {
    await submitCassettes()
}

main()

