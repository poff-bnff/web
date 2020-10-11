const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const h2p = require('html2plaintext')

const { strapiQuery } = require("../../helpers/strapiQuery.js")

const DYNAMIC_PATH = path.join(__dirname, '..', 'dynamic')

const FILMS_FN = path.join(DYNAMIC_PATH, 'films.yaml')
const EVENTIVAL_FILMS = yaml.safeLoad(fs.readFileSync(FILMS_FN))

const SCREENINGS_FN = path.join(DYNAMIC_PATH, 'screenings.yaml')
const EVENTIVAL_SCREENINGS = yaml.safeLoad(fs.readFileSync(SCREENINGS_FN))

const STRAPI_URL = 'http://139.59.130.149'
const FILMS_API = `${STRAPI_URL}/films`
const CASSETTES_API = `${STRAPI_URL}/cassettes`
const SCREENINGS_API = `${STRAPI_URL}/screenings`

const sourceDir =  path.join(__dirname, '..', '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))

const ET = { // eventival translations
    categories: {
        "PÖFF" : "2",
        "Just Film": "3",
        "Shorts" : "4",
        "Shortsi alam" : "4",
        "KinoFF" : "5",
    }
}

const E_FILMS = EVENTIVAL_FILMS.map(e_film => {
    const f_language = STRAPIDATA.Language.filter((s_language) => {
        if(e_film.film_info && e_film.film_info.languages) {
            return e_film.film_info.languages.map( item => { return item.code } ).includes(s_language.code)
        }
    }).map(e => { return {id: e.id.toString()} })

    const f_country = STRAPIDATA.Country.filter((s_country) => {
        if(e_film.film_info && e_film.film_info.countries) {
            return e_film.film_info.countries.map( item => { return item.code } ).includes(s_country.code)
        }
    }).map(e => { return {id: e.id.toString()} })

    const f_subLang = STRAPIDATA.Language.filter((s_subLang) => {
        if(e_film.film_info && e_film.film_info.subtitle_languages) {
            return e_film.film_info.subtitle_languages.map( item => { return item.code} ).includes(s_subLang.code)
        }
    }).map(e => { return {id: e.id.toString()} })

    const f_programme = STRAPIDATA.Programme.filter((s_programme) => {
        if(e_film.eventival_categorization && e_film.eventival_categorization.sections ) {
            let sections = e_film.eventival_categorization.sections
            return sections.map( item => { return item.id.toString() } ).includes(s_programme.remoteId)
        }
    }).map(e => { return {id: e.id.toString()} })

    const f_genre = STRAPIDATA.TagGenre.filter((s_genre) => {
        if(e_film.film_info.types) {
            return e_film.film_info.types.includes(s_genre.et)
        }
    }).map(e => { return {id: e.id.toString()} })

    const f_keyword = STRAPIDATA.TagKeyword.filter((s_keyword) => {
        if(e_film.eventival_categorization.tags) {
            return e_film.eventival_categorization.tags.includes(s_keyword.et)
        }
    }).map(e => { return {id: e.id.toString()} })

    const f_premiereType = STRAPIDATA.TagPremiereType.filter((s_premiereType) => {
        if(e_film.film_info && e_film.film_info.premiere_type) {
            return e_film.film_info.premiere_type === s_premiereType.en
        }
    }).map(e => { return {id: e.id.toString()} })

    let categorization = e_film.eventival_categorization && e_film.eventival_categorization.categories
    const f_festivalEdition = categorization ? e_film.eventival_categorization.categories.map(e => { return {id: ET.categories[e]} }) : []

    let film_out = {

        remoteId: ((e_film.ids && e_film.ids.system_id) ? e_film.ids : {'system_id': ''}).system_id.toString(),
        title_et: (e_film.titles ? e_film.titles : {'title_local': ''}).title_local,
        title_en: (e_film.titles ? e_film.titles : {'title_english': ''}).title_english,
        title_ru: (e_film.titles ? e_film.titles : {'title_custom': ''}).title_custom,
        titleOriginal: (e_film.titles ? e_film.titles : {'title_original': ''}).title_original,
        year: (((e_film.film_info && e_film.film_info.completion_date) ? e_film.film_info.completion_date  : {'year' : ''}).year).toString(),
        runtime: ((((e_film.film_info && e_film.film_info.runtime) ? e_film.film_info.runtime : { 'seconds' : ''}).seconds)/ 60).toString(),
        festival_edition: f_festivalEdition,
        // otherFestivals: '?',
        tags: {
            premiere_types: f_premiereType,
            genres: f_genre,
            keywords: f_keyword,
            programmes: f_programme
        },
        countries: f_country,
        languages: f_language,
        subtitles: f_subLang,
        // credentials: {
        //     rolePerson: { // strapis amet ja nimi
        //          order: (num),
        //         role_at_film: {
        //             id: e_film.publications.en // strapis RolesAtFilm.roleNamePrivate
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
        //             id :
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

    if (e_film.publications) {
        const publications = e_film.publications
        for (const [lang, publication] of Object.entries(publications)) {
            if ('synopsis_long' in publication) {
                if (film_out['synopsis'] === undefined) {
                    film_out['synopsis'] = {}
                }
                film_out['synopsis'][lang] = h2p(publication.synopsis_long)
            }
        }
    }


    film_out.title_et = h2p(film_out.title_et)
    film_out.title_en = h2p(film_out.title_en)
    film_out.title_ru = h2p(film_out.title_ru)
    film_out.title_original = h2p(film_out.title_original)

    return film_out
})
fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_FILMS.yaml'), yaml.safeDump(E_FILMS, { 'indent': '4' }), "utf8")


console.log('E_FILMS', E_FILMS[3])
console.log('E_FILMS', h2p(E_FILMS[3].title_et))

const E_CASSETTES = (EVENTIVAL_FILMS.map(e_film => {
    const strapiFilm = STRAPIDATA.Film.filter((s_film) => {
        if (e_film.ids && e_film.ids.system_id) {
            return s_film.remoteId === e_film.ids.system_id.toString()
        }
    })
    let c_films = []
    if (strapiFilm.length) {
        c_films.push({id: strapiFilm[0].id.toString()})
    }

    // const strapiCassettePresenter = STRAPIDATA.Organisation.filter((s_presenter) =>{
    //     if(e_film.film_info && e_film.film_info.relationships && e_film.film_info.relationships.contacts ){
    //         return e_film.film_info.relationships.contacts.map( item => { return item.companies ).includes(s_presenter.name.en)
    //     }
    // })
    // let c_cassettePresenter = []
    // if (strapiCassettePresenter.length){
    //     c_cassettePresenter.push({id: strapiCassettePresenter[0].id.toString()})
    // }

    const c_programme = STRAPIDATA.Programme.filter((s_programme) => {
        if(e_film.eventival_categorization && e_film.eventival_categorization.sections ) {
            let sections = e_film.eventival_categorization.sections
            return sections.map( item => { return item.id.toString() } ).includes(s_programme.remoteId)
        }
    }).map(e => { return {id: e.id.toString()} })

    const c_genre = STRAPIDATA.TagGenre.filter((s_genre) => {
        if(e_film.film_info.types) {
            return e_film.film_info.types.includes(s_genre.et)
        }
    }).map(e => { return {id: e.id.toString()} })

    const c_keyword = STRAPIDATA.TagKeyword.filter((s_keyword) => {
        if(e_film.eventival_categorization.tags) {
            return e_film.eventival_categorization.tags.includes(s_keyword.et)
        }
    }).map(e => { return {id: e.id.toString()} })

    const c_premiereType = STRAPIDATA.TagPremiereType.filter((s_premiereType) => {
        if(e_film.film_info && e_film.film_info.premiere_type) {
            return e_film.film_info.premiere_type === s_premiereType.en
        }
    }).map(e => { return {id: e.id.toString()} })

    let cassette_out = {
        remoteId: (e_film.ids ? e_film.ids : {'system_id': ''}).system_id.toString(),
        title_et: h2p((e_film.titles ? e_film.titles : {'title_local': ''}).title_local),
        title_en: h2p((e_film.titles ? e_film.titles : {'title_english': ''}).title_english),
        title_ru: h2p((e_film.titles ? e_film.titles : {'title_custom': ''}).title_custom),
        // festival_edition: e_film.eventival_categorization.categories.category,//sama mis yleval
        tags: {
            premiere_types: c_premiereType,
            genres: c_genre,
            keywords: c_keyword,
            programmes: c_programme
        },
        // presenters: c_cassettePresenter, //pole kindel kas 6ige koht mida e_films lugeda
        films: c_films
    }
    if (e_film.publications) {
        const publications = e_film.publications
        for (const [lang, publication] of Object.entries(publications)) {
            if ('synopsis_long' in publication) {
                if (cassette_out['synopsis'] === undefined) {
                    cassette_out['synopsis'] = {}
                }
                cassette_out['synopsis'][lang] = h2p(publication.synopsis_long)
            }
        }
    }

    return cassette_out
}))
fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_CASSETTES.yaml'), yaml.safeDump(E_CASSETTES, { 'indent': '4' }), "utf8")


const E_SCREENINGS = (EVENTIVAL_SCREENINGS.map(e_screening => {
    const scr_cassette = STRAPIDATA.Cassette.filter((s_cassette) => {
        if (e_screening.film && e_screening.film.id) {
            return s_cassette.remoteId === e_screening.film.id.toString()
        }
    }).map(cassette => { return {id: cassette.id.toString()} })[0]

    const scr_screeningType = STRAPIDATA.ScreeningType.filter((s_screeningType) => {
        if(e_screening.type_of_screening) {
            return e_screening.type_of_screening.includes(s_screeningType.name)
        }
    }).map(screening_type => screening_type.id.toString())

    const scr_subLang = STRAPIDATA.Language.filter((s_scrSubLang) => {
        if(e_screening.film && e_screening.film.subtitle_languages ) {
            let languages = e_screening.film.subtitle_languages.print.languages
            languages = (Array.isArray(languages) ? languages : [languages])

            return languages.includes(s_scrSubLang.code)
        }
    }).map(subLang => subLang.id.toString())


    let screening_out = {
        code: e_screening.code,
        codeAndTitle: e_screening.code + '; ' + e_screening.film.title_english,
        // ticketingId: lisatakse stapis?,
        ticketingUrl: e_screening.ticketing_url,
        dateTime: e_screening.start, // tuleb kujul '2020-11-24 17:00:00'
        // introQaConversation: {                // e-presentation -> intro, e-qa -> conversation
        //     yesNo: e_screening.presentation.available, //#(Boolean) 0 v 1
        //     // type: (Enumeration), intro, Q&A vms
        //     // mode: (Enumeration), online/live vms
        //     presenter: [{ //kas e_sreening.presenters on org name ?
        //         et: e_screening.qa.guests,
        //         en: e_screening.qa.guests,
        //         ru: e_screening.qa.guests
        //     }],
        //     guest:  [{
        //         et: e_screening.qa.guests,
        //         en: e_screening.qa.guests,
        //         ru: e_screening.qa.guests
        //     }],
        //     duration: e_screening.qa.duration.toString(),
        //     // clipUrl: (text)
        // },
        durationTotal: e_screening.complete_duration_minutes.toString(),
        // location: {
        //     // id: ,// strapi Location v6iks sisaldada e cinaema_hall_id remoteIDna? v6i
        // },
        // extraInfo: text, // tuleb kolmeskeele, kuidas kuvame? Kas peaks olema teine translated
        ////  e_screenig.additional_info { et, en, ru}
        screening_types: scr_screeningType,
        // screening_mode: {
        //     id: /screening-modes ei leia e infost
        // },
        // subtitles: scr_subLang, peaks lapikumaks tegema, kui kasutame print v44rtust
        cassette: scr_cassette,
        // bookingUrl: (text),
        remoteId: e_screening.id.toString()

    }

    return screening_out
}))
fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_SCREENINGS.yaml'), yaml.safeDump(E_SCREENINGS, { 'indent': '4' }), "utf8")


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


async function submitScreening(e_screening) {
    let options = {
        headers: { 'Content-Type': 'application/json' }
    }

    const strapiScreening = STRAPIDATA.Screening.filter((screening) => {
        return screening.remoteId === e_screening.remoteId
    })

    if (strapiScreening.length) {
        e_screening['id'] = strapiScreening[0].id
        options.path = SCREENINGS_API + '/' + e_screening.id
        options.method = 'PUT'
    } else {
        options.path = SCREENINGS_API
        options.method = 'POST'
    }
    const screening_from_strapi = await strapiQuery(options, e_screening)
    return screening_from_strapi
}

const submitScreenings = async () => {
    let from_strapi = []
    for (const ix in E_SCREENINGS) {
        // if (ix > 5) { continue }
        const screening_from_strapi = await submitScreening(E_SCREENINGS[ix])
        from_strapi.push(screening_from_strapi)
    }
    return from_strapi
}

const main = async () => {
    await submitFilms()
    await submitCassettes()
    await submitScreenings()
}

main()

