const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const h2p = require('html2plaintext')

const { strapiQuery } = require("../../helpers/strapiQuery.js")


const FILMS_FN = path.join(__dirname, '../dynamic/films.yaml')
const EVENTIVAL_FILMS = yaml.safeLoad(fs.readFileSync(FILMS_FN))
const SCREENINGS_FN = path.join(__dirname, '../dynamic/screenings.yaml')
const EVENTIVAL_SCREENINGS = yaml.safeLoad(fs.readFileSync(SCREENINGS_FN))

const STRAPI_URL = 'http://139.59.130.149'
const FILMS_API = `${STRAPI_URL}/films`
const CASSETTES_API = `${STRAPI_URL}/cassettes`

const sourceDir =  path.join(__dirname, '..', '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))


const E_FILMS = EVENTIVAL_FILMS.map(e_film => {
    const strapiLang = STRAPIDATA.Language.filter((s_language) => {
        if( e_film.film_info && e_film.film_info.languages){
            return e_film.film_info.languages.map( item => { return item.code } ).includes(s_language.code)
        }
    })
    let f_language = []
    if (strapiLang.length){
        f_language.push({id: strapiLang[0].id.toString()})
    }

    const strapiCountry = STRAPIDATA.Country.filter((s_country) => {
        if( e_film.film_info && e_film.film_info.countries) {
            return e_film.film_info.countries.map( item => { return item.code } ).includes(s_country.code)
        }
    })
    let f_country = []
    if (strapiCountry.length){
        f_country.push({id: strapiCountry[0].id.toString()})
    }

    const strapiSubLang = STRAPIDATA.Language.filter((s_subLang) =>{
        if(e_film.film_info && e_film.film_info.subtitle_languages ){
            return e_film.film_info.subtitle_languages.map( item => { return item.code} ).includes(s_subLang.code)
        }
    })
    let f_SubLang = []
    if (strapiSubLang.length){
        f_SubLang.push({id: strapiSubLang[0].id.toString()})
    }

    const strapiProgramme = STRAPIDATA.Programme.filter((s_programme) => {
        if(e_film.eventival_categorization && e_film.eventival_categorization.sections ) {
            let sections = e_film.eventival_categorization.sections
            // console.log(sections);
            return sections.map( item => { return item.id.toString() } ).includes(s_programme.remoteId)
        }
    })
    let f_programme = []
    if (strapiProgramme.length){
        f_programme.push({id: strapiProgramme[0].id.toString()})
    }

    // const strapiGenre = STRAPIDATA.TagGenre.filter((s_genre) =>{
    //     if(e_film.film_info.types && e_film.film_info.types.type ){
    //         e_film.film_info.types.type.map( item => { return item.id } ).includes(s_genre.remoteId)
    //     }
    // })
    // let f_genre = []
    // if (strapiGenre.length){
    //     f_genre.push({id: strapiGenre[0].id.toString()})
    // }

    const strapiFestivalEdition = STRAPIDATA.FestivalEdition.filter((s_festivalEdition) =>{
        if(e_film.eventival_categorization && e_film.film_info.types.type ){
            return e_film.eventival_categorization.categories.includes(s_festivalEdition.name_et)
        }
    })
    let f_festivalEdition = []
    if (strapiFestivalEdition.length){
        f_festivalEdition.push({id: strapiFestivalEdition[0].id.toString()})
    }


    // const strapiPerson = STRAPIDATA.Person.filter((s_person) =>{

    //     return s_person.name === e_film.eventival_categorization.sections.name
    // })
    // let f_person = []
    // if (strapiPerson.length){
    //     f_person.push({id: strapiPerson[0].id.toString()})
    // }

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
        //     premiere_types: '?',
        //     genres: [e_film.film_info.types.type],
        //     keywords: [e_film.eventival_categorization.tags.tag],
            programmes: f_programme
        },
        countriesAndLanguages: {
            countries: f_country,
            languages: f_language
        },
        // subtitles: f_SubLang,
        // credentials: {
        //     rolePerson: {
        //         role_at_film: {
        //             id: e_film.publications.en //....
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
        //             id : saame rolesAtFilm nime
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
                film_out['synopsis'][lang] = h2p(publication.synopsis_long.__cdata)
            }
        }
    }


    film_out.title_et = h2p(film_out.title_et)
    film_out.title_en = h2p(film_out.title_en)
    film_out.title_ru = h2p(film_out.title_ru)
    film_out.title_original = h2p(film_out.title_original)

    return film_out
})

console.log('E_FILMS', E_FILMS[3])
console.log('E_FILMS', h2p(E_FILMS[3].title_et))

const E_CASSETTES = (EVENTIVAL_FILMS.map(e_film => {
    const strapiFilm = STRAPIDATA.Film.filter((s_film) => {
        if (e_film.ids && e_film.ids.system_id){
            return s_film.remoteId === e_film.ids.system_id.toString()
        }
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


const E_SCREENINGS = (EVENTIVAL_SCREENINGS.map(e_screening => {
    const strapiCassette = STRAPIDATA.Cassette.filter((s_cassette) => {
        if (e_screening.film && e_screening.film.id){
            return s_cassette.remoteId === e_screening.film.id.toString()
        }
    })
    let scr_cassette = {}
    if (strapiCassette.length) {
        scr_cassette = {id: strapiCassette[0].id.toString()}
    }

    let screening_out = {
        code: e_screening.code,
        codeAndTitle: e_screening.code + '; ' + e_screening.film.title_english,
        // ticketingId: stapis?,
        ticketingUrl: e_screening.ticketing_url,
        dateTime: e_screening.start, // tuleb kujul '2020-11-24 17:00:00'
        introQaConversation: {
            yesNo: e_screening.presentation.available, //#(Boolean) 0 v 1
            // type: (Enumeration),
            // mode: (Enumeration),
            presenter: [{
                et: '0',
                en: '0',
                ru: '0'
            }],
            guest:  [{
                et: '0',
                en: '0',
                ru: '0'
            }],
            duration: e_screening.qa.duration.toString(),
            // clipUrl: (text)
        },
        durationTotal: e_screening.complete_duration_minutes.toString(),
        location: {
            id: e_screening.venue_id // sealt nimi ja selle alt stapile vastav id
        },
        // extraInfo: text, // tuleb kolmeskeele, kuidas kuvame? Kas peaks olema teine translated
        ////  e_screenig.additional_info { et, en, ru}
        screening_types: [{
            id: e_screening.type_of_screening, // saame nt PRESS vaja id
        }],
        // screening_mode: {
        //     id: /screening-modes
        // },
        // subtitles: [{
        //     id : language id
        // }],
        cassette: scr_cassette,
        // bookingUrl: (text),
        remoteId: e_screening.id

    }
    return screening_out
}))

console.log(E_SCREENINGS);

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
    // await submitCassettes()
}

main()

