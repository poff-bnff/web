const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

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
const PERSONS_API = `${STRAPI_URL}/people`
const ROLES_API = `${STRAPI_URL}/role-at-films`

const sourceDir =  path.join(__dirname, '..', '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))

const STRAPI_GET_PERSONS_OPTIONS = {
    headers: { 'Content-Type': 'application/json' },
    path: PERSONS_API + '?_limit=-1',
    method: 'GET'
}
let STRAPI_GET_ROLES_OPTIONS = {
    headers: { 'Content-Type': 'application/json' },
    path: ROLES_API + '?_limit=-1',
    method: 'GET'
}
let STRAPI_GET_FILMS_OPTIONS = {
    headers: { 'Content-Type': 'application/json' },
    path: FILMS_API + '?_limit=-1',
    method: 'GET'
}

const ET = { // eventival translations
    categories: {
        "PÖFF" : "1",
        "Just Film": "3",
        "Shorts" : "2",
        "Shortsi alam" : "2",
        "KinoFF" : "4",
    }
}

const EVENTIVAL_REMAPPED = {}

const s_person_id_by_e_fullname = (e_name, s_persons) => {
    const s_person = s_persons.filter(s_person => {
        return e_name === s_person.firstName + (s_person.lastName ? ' ' + s_person.lastName : '')
    })[0]
    if (s_person === undefined) {
        console.log('cant locate', e_name);
        return null
    }
    return s_person.id
}
const s_film_id_by_e_remote_id = (remote_id, s_films) => {
    return s_films.filter(s_film => {
        return remote_id.toString() === s_film.remoteId
    })[0].id
}
const s_role_id_by_e_crew_type = (e_crew, s_roles) => {
    if (e_crew.strapi_role_at_film) {
        return e_crew.strapi_role_at_film
    }
    return s_roles.filter(s_role => {
        return e_crew.type.id.toString() === s_role.remoteId
    })[0].id
}

const updateStrapi = async () => {
    const updateStrapiPersons = async () => {
        const submitPersonByRemoteId = async (e_person, strapi_persons) => {
            let options = {
                headers: { 'Content-Type': 'application/json' }
            }
            const strapi_person = strapi_persons.filter((person) => {
                return person.remoteId === e_person.remoteId
            })

            if (strapi_person.length) {
                e_person['id'] = strapi_person[0].id
                options.path = PERSONS_API + '/' + e_person.id
                options.method = 'PUT'
            } else {
                options.path = PERSONS_API
                options.method = 'POST'
            }
            const person_from_strapi = await strapiQuery(options, e_person)
            return person_from_strapi
        }

        const submitPersonsByRemoteId = async (e_persons, strapi_persons) => {
            let from_strapi = []
            for (const ix in e_persons) {
                const person_from_strapi = await submitPersonByRemoteId(e_persons[ix], strapi_persons)
                from_strapi.push(person_from_strapi)
            }
            return from_strapi
        }

        // Add Directors and Cast to Strapi
        let strapi_persons = await strapiQuery(STRAPI_GET_PERSONS_OPTIONS)
        let persons_in_eventival = []
        for (const e_film of EVENTIVAL_FILMS ) {
            if (! (e_film.film_info && e_film.film_info.relationships) ) { continue }
            const relationships = e_film.film_info.relationships
            let e_persons = [].concat(relationships.directors || [], relationships.cast || [])
                .map(person => {
                    return {remoteId: person.id.toString(), firstName: person.name, lastName: person.surname}
                })
            persons_in_eventival = [].concat(persons_in_eventival, e_persons)
        }
        await submitPersonsByRemoteId(persons_in_eventival, strapi_persons)


        // add all the crew to strapi
        let crew_names = {}
        for (const e_film of EVENTIVAL_FILMS ) {
            if (! (e_film.publications && e_film.publications.en && e_film.publications.en.crew) ) { continue }
            for (const e_crew of e_film.publications.en.crew) {
                for (const name of e_crew.text) {
                    crew_names[name] = {}
                }
            }
        }
        strapi_persons = await strapiQuery(STRAPI_GET_PERSONS_OPTIONS)
        for (const e_name in crew_names) {
            let s_person = s_person_id_by_e_fullname(e_name, strapi_persons)
            if (!s_person) {
                let options = {
                    headers: { 'Content-Type': 'application/json' },
                    path: PERSONS_API,
                    method: 'POST'
                }
                let data = { firstName: e_name }
                let new_person = await strapiQuery(options, data)
                console.log('==== new person', e_name);
            }
        }
        return await strapiQuery(STRAPI_GET_PERSONS_OPTIONS)
    }

    const updateStrapiRoles = async () => {
        let strapi_roles = await strapiQuery(STRAPI_GET_ROLES_OPTIONS)

        for (const e_film of EVENTIVAL_FILMS ) {
            // skip if there is no roles (no crew) to check
            if (! (e_film.publications && e_film.publications.en && e_film.publications.en.crew) ) { continue }

            for (const e_crew of e_film.publications.en.crew) {
                // role already in Strapi
                if (e_crew.strapi_role_at_film) { continue }

                // role with remoteId already present in Strapi
                if (e_crew.type && e_crew.type.id) {
                    let filtered = strapi_roles.filter(s_role => {
                        return s_role.remoteId === e_crew.type.id.toString()
                    })
                    if (filtered[0]) {
                        continue
                    }
                }

                // we have new role
                if (e_crew.type && e_crew.type.id && e_crew.type.name) {
                    let options = {
                        headers: { 'Content-Type': 'application/json' },
                        path: ROLES_API,
                        method: 'POST'
                    }
                    let data = {
                        roleNamePrivate: e_crew.type.name,
                        roleName: {en: e_crew.type.name},
                        remoteId: e_crew.type.id.toString()
                    }
                    let s_role = await strapiQuery(options, data)
                    console.log('new role', options, data, s_role)
                    strapi_roles.push(s_role)
                }
            }
        }
        return strapi_roles
    }

    const updateFilmCredentials = async () => {
        const s_persons = await strapiQuery(STRAPI_GET_PERSONS_OPTIONS)
        const s_roles = await strapiQuery(STRAPI_GET_ROLES_OPTIONS)
        const s_films = await strapiQuery(STRAPI_GET_FILMS_OPTIONS)
        for (const e_film of EVENTIVAL_FILMS) {
            // skip if there is no roles (no crew) to check
            if (! (e_film.publications && e_film.publications.en && e_film.publications.en.crew) ) { continue }
            // console.log(e_film);
            let s_film = {id: s_film_id_by_e_remote_id(e_film.ids.system_id, s_films), credentials: {rolePerson: []}}
            for (const e_crew of e_film.publications.en.crew) {
                const role_id = s_role_id_by_e_crew_type(e_crew, s_roles)
                s_film.credentials.rolePerson = [].concat(
                    s_film.credentials.rolePerson,
                    e_crew.text.map(name => {
                        return {
                            role_at_film: { id: role_id },
                            person: { id: s_person_id_by_e_fullname(name, s_persons) }
                        }
                    }
                ).filter(rp => {return rp.person.id}))
            }
            let options = {
                headers: { 'Content-Type': 'application/json' },
                path: FILMS_API + '/' + s_film.id,
                method: 'PUT'
            }
            // console.log(options, JSON.stringify(s_film, null, 2))
            await strapiQuery(options, {id: s_film_id_by_e_remote_id(e_film.ids.system_id, s_films), credentials: null})
            await strapiQuery(options, s_film)
        }
    }

    await updateStrapiPersons()
    await updateStrapiRoles()
    await updateFilmCredentials()
}

const remapEventival = () => {
    EVENTIVAL_REMAPPED['E_FILMS'] = EVENTIVAL_FILMS.map(e_film => {
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

        const if_categorization = e_film.eventival_categorization && e_film.eventival_categorization.categories ? true : false
        const f_festivalEditions = if_categorization ? e_film.eventival_categorization.categories.map(e => { return {id: ET.categories[e]} }) : []
        // console.log( 'f_festivalEditions', if_categorization, f_festivalEditions );

        // const director_at_film = STRAPIDATA.RolesAtFilm.filter(role => role.NamePrivate === 'Director')[0]
        // let f_director_persons = e_film.publications.en.directors.map(name => {
        //     return ensurePerson(name)
        // })
        // console.log( f_director_persons );
        // const f_role_persons = f_director_persons.map((dire_person, ix) => {
        //     return {
        //         order: ix + 1,
        //         role_at_film: role_at_film.id,
        //         person: dire_person.id
        //     }
        // })
        // console.log('directors', f_role_persons)

        let film_out = {

            remoteId: ((e_film.ids && e_film.ids.system_id) ? e_film.ids : {'system_id': ''}).system_id.toString(),
            title_et: (e_film.titles ? e_film.titles : {'title_local': ''}).title_local.toString(),
            title_en: (e_film.titles ? e_film.titles : {'title_english': ''}).title_english.toString(),
            title_ru: (e_film.titles ? e_film.titles : {'title_custom': ''}).title_custom.toString(),
            titleOriginal: (e_film.titles ? e_film.titles : {'title_original': ''}).title_original.toString(),
            year: (e_film.film_info && e_film.film_info.completion_date && e_film.film_info.completion_date.year ? e_film.film_info.completion_date.year : null),
            runtime: ((((e_film.film_info && e_film.film_info.runtime) ? e_film.film_info.runtime : {'seconds' : ''}).seconds)/ 60).toString(),
            festival_editions: f_festivalEditions,
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
            //     rolePerson: f_role_persons,
            // }
            // credentials: {
            //     rolePerson: [{ // strapis amet ja nimi
            //         order: (num),
            //         role_at_film: {
            //             id: e_film.publications.en // strapis RolesAtFilm.roleNamePrivate
            //         },
            //         person: {
            //             id: '?'
            //         }
            //     }],
            //     roleCompany: [{
            //         order: (num),
            //         role_at_film: {
            //             id: '?'
            //         },
            //         person: {
            //             id :
            //         }
            //     }]
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
            // world_sales: [{
            //         id: organisation.name.et
            // }]
        }

        if (e_film.publications) {
            const publications = e_film.publications
            for (const [lang, publication] of Object.entries(publications)) {
                if ('synopsis_long' in publication) {
                    if (film_out['synopsis'] === undefined) {
                        film_out['synopsis'] = {}
                    }
                    film_out['synopsis'][lang] = publication.synopsis_long
                }
            }
        }

        // console.log(film_out);
        return film_out
    })
    fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_FILMS.yaml'), yaml.safeDump(EVENTIVAL_REMAPPED['E_FILMS'], { 'indent': '4' }), "utf8")


    // console.log('E_FILMS', EVENTIVAL_REMAPPED['E_FILMS'][3])
    // console.log('E_FILMS', h2p(EVENTIVAL_REMAPPED['E_FILMS'][3].title_et))

    EVENTIVAL_REMAPPED['E_CASSETTES'] = (EVENTIVAL_FILMS.map(e_film => {
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

        const if_categorization = e_film.eventival_categorization && e_film.eventival_categorization.categories
        const c_festivalEditions = if_categorization ? e_film.eventival_categorization.categories.map(e => { return {id: ET.categories[e]} }) : []

        let cassette_out = {
            remoteId: (e_film.ids ? e_film.ids : {'system_id': ''}).system_id.toString(),
            title_et: (e_film.titles ? e_film.titles : {'title_local': ''}).title_local.toString(),
            title_en: (e_film.titles ? e_film.titles : {'title_english': ''}).title_english.toString(),
            title_ru: (e_film.titles ? e_film.titles : {'title_custom': ''}).title_custom.toString(),
            festival_editions: c_festivalEditions,
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
                    cassette_out['synopsis'][lang] = publication.synopsis_long
                }
            }
        }

        return cassette_out
    }))
    fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_CASSETTES.yaml'), yaml.safeDump(EVENTIVAL_REMAPPED['E_CASSETTES'], { 'indent': '4' }), "utf8")


    EVENTIVAL_REMAPPED['E_SCREENINGS'] = (EVENTIVAL_SCREENINGS.map(e_screening => {
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
            code: e_screening.code.toString().padStart(6, "0"),
            codeAndTitle: e_screening.code.toString().padStart(6, "0") + ' / ' + e_screening.film.title_local,
            ticketingUrl: e_screening.ticketing_url,
            dateTime: e_screening.start, // tuleb kujul '2020-11-24 17:00:00'
            // introQaConversation: [{                // e-presentation -> intro, e-qa -> conversation
            //     yesNo: e_screening.qa.available.toString(), e_screening.presentation.available.toString()
            //     // type: (Enumeration), intro, conversation
            //     // mode: j44b tyhjaks, kui qa klipp siis mode online
            //     presenter: [{ //kas e_sreening.presenters on org name ?
            //         et: e_screening.qa.presenters, e_screening.presentation.presenters
            //         en: e_screening.qa.presenters,
            //         ru: e_screening.qa.presenters
            //     }],
            //     guest:  [{
            //         et: e_screening.qa.guests, e_screening.presentation.guests
            //         en: e_screening.qa.guests,
            //         ru: e_screening.qa.guests
            //     }],
            //     duration: e_screening.qa.duration.toString(), e_screening.presentation.duration.toString()
            //     // clipUrl: (text)
            // }],
            durationTotal: e_screening.complete_duration_minutes.toString(),
            // location: {
            //     // id: , venue id, strapis location remoteId kui screening online saal siis mode online
            // },
            // extraInfo: {
            //     et: 'text',
            //     en: 'text',
            //     ru: 'text'
            // },
            screening_types: scr_screeningType,
            // screening_mode: {
            //     id: /screening-modes ei leia e infost saab info location j4rgi
            // },
            subtitles: scr_subLang,
            cassette: scr_cassette,
            remoteId: e_screening.id.toString()

        }

        return screening_out
    }))
    fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_SCREENINGS.yaml'), yaml.safeDump(EVENTIVAL_REMAPPED['E_SCREENINGS'], { 'indent': '4' }), "utf8")
}


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
    for (const ix in EVENTIVAL_REMAPPED['E_FILMS']) {
        // if (ix > 5) { continue }
        const film_from_strapi = await submitFilm(EVENTIVAL_REMAPPED['E_FILMS'][ix])
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
    for (const ix in EVENTIVAL_REMAPPED['E_CASSETTES']) {
        // if (ix > 5) { continue }
        const cassette_from_strapi = await submitCassette(EVENTIVAL_REMAPPED['E_CASSETTES'][ix])
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
    for (const ix in EVENTIVAL_REMAPPED['E_SCREENINGS']) {
        // if (ix > 5) { continue }
        const screening_from_strapi = await submitScreening(EVENTIVAL_REMAPPED['E_SCREENINGS'][ix])
        from_strapi.push(screening_from_strapi)
    }
    return from_strapi
}

const main = async () => {
    console.log('update Strapi')
    await updateStrapi()
    // console.log('remap')
    // remapEventival()
    // console.log('submit films')
    // await submitFilms()
    // console.log('submit cassettes')
    // await submitCassettes()
    // console.log('submit screenings')
    // await submitScreenings()
}

main()
