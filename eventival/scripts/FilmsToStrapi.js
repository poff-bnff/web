const = require('http')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const { strapiAuth } = require("../../helpers/strapiAuth.js")
const { strapiQuery } = require("../../helpers/strapiQuery.js")


const films_fn = path.join(__dirname, '../dynamic/films.yaml')
const yamlStr = fs.readFileSync(films_fn)

const FILMS_API = 'http://139.59.130.149/films'
const CASSETTES_API = 'http://139.59.130.149/cassettes'

const eventivalFilms = (yaml.safeLoad(yamlStr).map(film => {
    let filmOut = {
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
                    id: film.publications.en....
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

    return filmOut
}))

const eventivalCassettes = (yaml.safeLoad(yamlStr).map(film => {
    let cassetteOut = {
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

    return cassetteOut
}))



const submitCassettes = async () => {
    const token = await strapiAuth()

    for (const ix in eventivalCassettes) {
        if (ix > 5) {
            continue
        }
        const e_cassette = eventivalCassettes[ix];
        const api = CASSETTES_API + '?remoteId=' + e_cassette.remoteId
        let options = {
            host: process.env['StrapiHost'],
            path: api,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
        const strapiCassette = await strapiQuery(options)
        let fromStrapi = {}

        if(strapiCassette.length) {
            e_cassette['id'] = strapiCassette[0].id
            options.path = CASSETTES_API + '/' + e_cassette.id
            options.method = 'PUT'

            fromStrapi = await strapiQuery(options, e_cassette)
        } else {
            options.path = CASSETTES_API
            options.method = 'POST'

            fromStrapi = await strapiQuery(options, e_cassette)
        }
        // console.log(fromStrapi)
    }
}

const submitFilms = async () => {
    const token = await strapiAuth()

    for (const ix in eventivalFilms) {
        if (ix > 5) {
            continue
        }
        const e_film = eventivalFilms[ix];
        const api = FILMS_API + '?remoteId=' + e_film.remoteId
        let options = {
            host: process.env['StrapiHost'],
            path: api,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
        const strapiFilm = await strapiQuery(options)
        let fromStrapi = {}

        if(strapiFilm.length) {
            e_film['id'] = strapiFilm[0].id
            options.path = FILMS_API + '/' + e_film.id
            options.method = 'PUT'

            fromStrapi = await strapiQuery(options, e_film)
        } else {
            options.path = FILMS_API
            options.method = 'POST'

            fromStrapi = await strapiQuery(options, e_film)
        }
        // console.log(fromStrapi)
    }
}

const main = async () => {
    await submitFilms()
}

main()
