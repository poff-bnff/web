const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const { strapiQuery, getModel } = require("../../helpers/strapiQuery.js")

const DYNAMIC_PATH = path.join(__dirname, '..', 'dynamic')

const FILMS_FN = path.join(DYNAMIC_PATH, 'films.yaml')
const EVENTIVAL_FILMS = yaml.safeLoad(fs.readFileSync(FILMS_FN))

const SCREENINGS_FN = path.join(DYNAMIC_PATH, 'screenings.yaml')
const EVENTIVAL_SCREENINGS = yaml.safeLoad(fs.readFileSync(SCREENINGS_FN))

const VENUES_FN = path.join(DYNAMIC_PATH, 'venues.yaml')
const EVENTIVAL_VENUES = yaml.safeLoad(fs.readFileSync(VENUES_FN))

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


const ET = { // eventival translations
    categories: {
        "PÖFF" : "1",
        "Just Film": "3",
        "Shorts" : "2",
        "Shortsi alam" : "2",
        "KinoFF" : "4",
    },
    utc2: '+0200' //TODO #366 kellaaeg dynaamiliseks
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
    return (s_films.filter(s_film => {
        return remote_id.toString() === s_film.remoteId
    })[0] || {id:null}).id
}
const s_role_id_by_e_crew_type = (e_crew, s_roles) => {
    if (e_crew.strapi_role_at_film) {
        return e_crew.strapi_role_at_film
    }
    return (s_roles.filter(s_role => {
        return e_crew.type.id.toString() === s_role.remoteId
    })[0] || {id:null}).id
}

const isUpdateRequired = (old_o, new_o) => {
    const sortedString = (o) => {
        if(o === undefined) {
            o = {}
        }
        return JSON.stringify(yaml.load(yaml.safeDump(o, {'sortKeys': true})))
    }
    const old_s = sortedString(old_o)
    const new_s = sortedString({...old_o, ...new_o})
    if (old_s !== new_s) {
        console.log('BEFORE:', old_s)
        console.log('UPDATE:', sortedString(new_o))
        console.log(' AFTER:', new_s)
        return true
    }
    return false
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
                // console.log('BEFORE:', sortedString(strapi_person[0]))
                e_person['id'] = strapi_person[0].id
                // console.log('UPDATE:', sortedString(e_person))
                options.path = PERSONS_API + '/' + e_person.id
                options.method = 'PUT'
            } else {
                options.path = PERSONS_API
                options.method = 'POST'
            }
            if(isUpdateRequired(strapi_person[0], e_person)) {
                const person_from_strapi = await strapiQuery(options, e_person)
                return person_from_strapi
            } else {
                // console.log('NO DIF:', JSON.stringify(strapi_person[0]))
                return strapi_person[0]
            }
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
        let strapi_persons = await getModel('Person')
        let persons_in_eventival = []
        for (const e_film of EVENTIVAL_FILMS ) {
            if (! (e_film.film_info && e_film.film_info.relationships) ) { continue }
            const relationships = e_film.film_info.relationships
            let e_persons = [].concat(relationships.cast || [])
                .map(person => {
                    return {
                        remoteId: person.id.toString(),
                        firstName: (person.name ? person.name : '').trim(),
                        lastName: (person.surname ? person.surname : '').trim(),
                        firstNameLastName: (person.name ? person.name : '').trim() + (person.surname ? ' ' + person.surname.trim() : '')
                    }
                })
            let e_directors = [].concat(relationships.directors || [])
                .map(person => {
                    return {
                        remoteId: person.id.toString(),
                        firstName: (person.name ? person.name : '').trim(),
                        lastName: (person.surname ? person.surname : '').trim(),
                        firstNameLastName: (person.name ? person.name : '').trim() + (person.surname ? ' ' + person.surname.trim() : ''),
                        profession: 'director'
                    }
                })
            persons_in_eventival = [].concat(persons_in_eventival, e_persons, e_directors)
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
        strapi_persons = await getModel('Person')
        for (const e_name in crew_names) {
            let s_person = s_person_id_by_e_fullname(e_name, strapi_persons)
            if (!s_person) {
                let options = {
                    headers: { 'Content-Type': 'application/json' },
                    path: PERSONS_API,
                    method: 'POST'
                }
                let data = { firstName: e_name.trim(), firstNameLastName: e_name.trim() }
                await strapiQuery(options, data)
                console.log('==== new person', e_name);
            }
        }
        return await getModel('Person')
    }

    const updateStrapiRoles = async () => {
        let strapi_roles = await getModel('RoleAtFilm')

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
        const s_persons = await getModel('Person')
        const s_roles = await getModel('RoleAtFilm')
        const s_films = await getModel('Film')
        for (const e_film of EVENTIVAL_FILMS) {
            // skip if there is no roles (no crew) to check
            if (! (e_film.publications && e_film.publications.en && e_film.publications.en.crew) ) { continue }
            // console.log(e_film);
            let s_film = s_films.filter(s_film => s_film.remoteId === e_film.ids.system_id.toString())[0]

            if(s_film === undefined){
                continue
            }
            s_film.credentials = s_film.credentials || {}
            s_film.credentials.rolePerson = s_film.credentials.rolePerson || []
            const s_creds_before = s_film.credentials.rolePerson.map(o => {
                return `${o.order}|${o.role_at_film.id}|${o.person.id}`
            }).join(',')


            s_film.credentials = {}
            s_film.credentials.rolePerson = []
            let cred_order_in_film = 1
            for (const e_crew of e_film.publications.en.crew) {
                const role_id = s_role_id_by_e_crew_type(e_crew, s_roles)
                s_film.credentials.rolePerson = [].concat(
                    s_film.credentials.rolePerson,
                    e_crew.text.map(name => {
                        const roleperson = {
                            order: cred_order_in_film++,
                            role_at_film: { id: role_id },
                            person: { id: s_person_id_by_e_fullname(name, s_persons) }
                        }
                        return roleperson
                    }).filter(rp => {return rp.person.id})
                )
            }

            const s_creds_after = s_film.credentials.rolePerson.map(o => {
                return `${o.order}|${o.role_at_film.id}|${o.person.id}`
            }).join(',')

            if (s_creds_before !== s_creds_after) {
                console.log('  ENNE', s_creds_before)
                console.log('P4RAST', s_creds_after)
                let options = {
                    headers: { 'Content-Type': 'application/json' },
                    path: FILMS_API + '/' + s_film.id,
                    method: 'PUT'
                }
                await strapiQuery(options, s_film)
            }

        }
    }
    console.log('\n|–– persons')
    await updateStrapiPersons()
    console.log('\n|–– roles')
    await updateStrapiRoles()
    console.log('\n|–– credentials')
    await updateFilmCredentials()
}

const remapEventival = async () => {
    const createMissingFilmsAndScreenings = async () => {
        const createStrapiFilm = async (remoteId) => {
            let options = {
                headers: { 'Content-Type': 'application/json' },
                path: FILMS_API,
                method: 'POST'
            }
            return await strapiQuery(options, {remoteId: remoteId})
        }
        const createStrapiCassette = async (remoteId) => {
            let options = {
                headers: { 'Content-Type': 'application/json' },
                path: CASSETTES_API,
                method: 'POST'
            }
            return await strapiQuery(options, {remoteId: remoteId})
        }
        const createStrapiScreening = async (remoteId) => {
            let options = {
                headers: { 'Content-Type': 'application/json' },
                path: SCREENINGS_API,
                method: 'POST'
            }
            return await strapiQuery(options, {remoteId: remoteId})
        }

        let strapi_films = await getModel('Film')
        for (const e_film of EVENTIVAL_FILMS) {
            let strapi_film = strapi_films.filter(s_film => s_film.remoteId === e_film.ids.system_id.toString())[0]
            let is_film_cassette = (e_film.film_info
                && e_film.film_info.texts
                && e_film.film_info.texts.logline
                && e_film.film_info.texts.logline !== '' ? true : false)
            if( is_film_cassette){
                continue
            }
            if ((! strapi_film)) {
                console.log('Creating new film in Strapi:', JSON.stringify(e_film.ids.system_id))
                await createStrapiFilm(e_film.ids.system_id.toString())
            }
        }

        let strapi_cassettes = await getModel('Cassette')
        for (const e_film of EVENTIVAL_FILMS) {
            let strapi_cassette = strapi_cassettes.filter(s_film => s_film.remoteId === e_film.ids.system_id.toString())[0]
            let is_cassette_film  = e_film.eventival_categorization
            && e_film.eventival_categorization.categories
            && e_film.eventival_categorization.categories.includes('Shortsi alam')
            if(is_cassette_film ){
                continue
            }
            if ((! strapi_cassette) ) {
                console.log('Creating new cassette in Strapi:', JSON.stringify(e_film.ids.system_id))
                await createStrapiCassette(e_film.ids.system_id.toString())
            }
        }

        let strapi_screenings = await getModel('Screening')
        for (const e_screening of EVENTIVAL_SCREENINGS) {
            let strapi_screening = strapi_screenings.filter(s_screening => e_screening.id.toString() === s_screening.remoteId)[0] || false
            if (! strapi_screening) {
                console.log('Creating screening in Strapi:', JSON.stringify(e_screening.id));
                await createStrapiScreening(e_screening.id.toString())
            }
        }
    }

    await createMissingFilmsAndScreenings()

    //
    // Films
    //
    const strapi_films = await getModel('Film')
    let to_strapi_films = []
    for (const e_film of EVENTIVAL_FILMS) {
        let strapi_film = strapi_films.filter(s_film => s_film.remoteId === e_film.ids.system_id.toString())[0]
        if (! strapi_film) {
            console.log('Missing film in Strapi:', JSON.stringify(e_film.ids.system_id));
            continue
        }

        const strapi_film_before = JSON.parse(JSON.stringify(strapi_film))
        const is_film_cassette = (e_film.film_info
            && e_film.film_info.texts
            && e_film.film_info.texts.logline
            && e_film.film_info.texts.logline !== '' ? true : false)
        if (is_film_cassette) {
            continue
        }

        strapi_film.is_cassette_film = (e_film.eventival_categorization
                                    && e_film.eventival_categorization.categories
                                    && e_film.eventival_categorization.categories.includes('Shortsi alam') ? true : false)

        // ---- BEGIN update strapi film properties
        // console.log('Update film in Strapi:', JSON.stringify(e_film.ids.system_id));

        strapi_film.title_et = (e_film.titles ? e_film.titles : {'title_local': ''}).title_local.toString()
        strapi_film.title_en = (e_film.titles ? e_film.titles : {'title_english': ''}).title_english.toString()
        strapi_film.title_ru = (e_film.titles ? e_film.titles : {'title_custom': ''}).title_custom.toString()
        strapi_film.titleOriginal = (e_film.titles ? e_film.titles : {'title_original': ''}).title_original.toString()
        strapi_film.year = (e_film.film_info && e_film.film_info.completion_date && e_film.film_info.completion_date.year ? e_film.film_info.completion_date.year : null)
        strapi_film.runtime = ((((e_film.film_info && e_film.film_info.runtime) ? e_film.film_info.runtime : {'seconds' : ''}).seconds)/ 60)
        if (!strapi_film.media) { strapi_film.media = {} }
        strapi_film.media.trailer = [{ url: (e_film.film_info  ? e_film.film_info : {'online_trailer_url' : '' }).online_trailer_url}]

        let strapi_tagPremiereType = await getModel('TagPremiereType')
        if (!strapi_film.tags) { strapi_film.tags = {} }
        strapi_film.tags.premiere_types = strapi_tagPremiereType.filter(s_premiereType => {
            if(e_film.film_info && e_film.film_info.premiere_type) {
                return e_film.film_info.premiere_type === s_premiereType.en
            }
        }).map(e => { return {id: e.id.toString()} })

        let strapi_tagGenre = await getModel('TagGenre')
        strapi_film.tags.genres = strapi_tagGenre.filter(s_genre => {
            if(e_film.film_info.types) {
                return e_film.film_info.types.includes(s_genre.et)
            }
        }).map(e => { return {id: e.id.toString()} })

        let strapi_tagKeyword = await getModel('TagKeyword')
        strapi_film.tags.keywords = strapi_tagKeyword.filter(s_keyword => {
            if(e_film.eventival_categorization.tags) {
                return e_film.eventival_categorization.tags.includes(s_keyword.et)
            }
        }).map(e => { return {id: e.id.toString()} })

        let strapi_programme = await getModel('Programme')
        strapi_film.tags.programmes = strapi_programme.filter(s_programme => {
            if(e_film.eventival_categorization && e_film.eventival_categorization.sections ) {
                let sections = e_film.eventival_categorization.sections
                return sections.map( item => { return item.id.toString() } ).includes(s_programme.remoteId)
            }
        }).map(e => { return {id: e.id.toString()} })

        const if_categorization = e_film.eventival_categorization && e_film.eventival_categorization.categories
        strapi_film.festival_editions = if_categorization ? e_film.eventival_categorization.categories.map(e => { return {id: ET.categories[e]} }) : []

        let country_order_in_film = 1
        strapi_film.orderedCountries = strapi_film.countries.map(e_country => {
            return {
                order: country_order_in_film++,
                country: e_country
            }
        })

        let strapi_language = await getModel('Language')
        strapi_film.languages = strapi_language.filter(s_language => {
            if(e_film.film_info && e_film.film_info.languages) {
                return e_film.film_info.languages.map( item => { return item.code } ).includes(s_language.code)
            }
        }).map(e => { return {id: e.id.toString()} })

        strapi_film.subtitles = strapi_language.filter(s_subLang => {
            if(e_film.film_info && e_film.film_info.subtitle_languages) {
                return e_film.film_info.subtitle_languages.map( item => { return item.code} ).includes(s_subLang.code)
            }
        }).map(e => { return {id: e.id.toString()} })

        if (e_film.publications) {
            const publications = e_film.publications
            for (const [lang, publication] of Object.entries(publications)) {
                if ('synopsis_long' in publication) {
                    if (!strapi_film.synopsis) {
                        strapi_film.synopsis = {}
                    }
                    strapi_film.synopsis[lang] = publication.synopsis_long
                }
            }
        }

        // ----   END update strapi film properties
        const strapi_film_after = JSON.parse(JSON.stringify(strapi_film))
        if(isUpdateRequired(strapi_film_before, strapi_film_after)){
            to_strapi_films.push(strapi_film)
        }
        // const strapi_film_json_after = JSON.stringify(strapi_film)
        // if (strapi_film_json !== strapi_film_json_after) {
        //     console.log('BEFORE:', strapi_film_json);
        //     console.log(' AFTER:', strapi_film_json_after);
        // }
    }
    EVENTIVAL_REMAPPED['E_FILMS'] = to_strapi_films
    fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_FILMS.yaml'), yaml.safeDump(to_strapi_films, { 'indent': '4' }), "utf8")
    // console.log('got films', EVENTIVAL_REMAPPED['E_FILMS'].length)

    //
    // Cassettes
    //
    const strapi_cassettes = await getModel('Cassette')
    let to_strapi_cassettes = []

    for (const e_cassette of EVENTIVAL_FILMS) {
        let strapi_cassette = strapi_cassettes.filter(s_cassette => s_cassette.remoteId === e_cassette.ids.system_id.toString())[0]
        if (! strapi_cassette) {
            continue
        }
        const is_cassette_film = e_cassette.eventival_categorization
            && e_cassette.eventival_categorization.categories
            && e_cassette.eventival_categorization.categories.includes('Shortsi alam')
        if (is_cassette_film) {
            continue
        }
        strapi_cassette.is_film_cassette = (e_cassette.film_info
            && e_cassette.film_info.texts
            && e_cassette.film_info.texts.logline
            && e_cassette.film_info.texts.logline !== '' ? true : false)
        // ---- BEGIN update strapi cassette properties

        strapi_cassette.title_et = (e_cassette.titles ? e_cassette.titles : {'title_local': ''}).title_local.toString()
        strapi_cassette.title_en = (e_cassette.titles ? e_cassette.titles : {'title_english': ''}).title_english.toString()
        strapi_cassette.title_ru = (e_cassette.titles ? e_cassette.titles : {'title_custom': ''}).title_custom.toString()

        const if_categorization = e_cassette.eventival_categorization && e_cassette.eventival_categorization.categories
        strapi_cassette.festival_editions = if_categorization ? e_cassette.eventival_categorization.categories.map(e => { return {id: ET.categories[e]} }) : []

        strapi_cassette.tags = e_cassette.tags || {}
        strapi_cassette.tags.genres = STRAPIDATA.TagGenre.filter((s_genre) => {
            if(e_cassette.film_info.types) {
                return e_cassette.film_info.types.includes(s_genre.et)
            }
        }).map(e => { return {id: e.id.toString()} })

        strapi_cassette.tags.keywords = STRAPIDATA.TagKeyword.filter((s_keyword) => {
            if(e_cassette.eventival_categorization.tags) {
                return e_cassette.eventival_categorization.tags.includes(s_keyword.et)
            }
        }).map(e => { return {id: e.id.toString()} })

        strapi_cassette.tags.premiere_types = STRAPIDATA.TagPremiereType.filter((s_premiereType) => {
            if(e_cassette.film_info && e_cassette.film_info.premiere_type) {
                return e_cassette.film_info.premiere_type === s_premiereType.en
            }
        }).map(e => { return {id: e.id.toString()} })

        strapi_cassette.tags.programmes = STRAPIDATA.Programme.filter((s_programme) => {
            if(e_cassette.eventival_categorization && e_cassette.eventival_categorization.sections ) {
                let sections = e_cassette.eventival_categorization.sections
                return sections.map( item => { return item.id.toString() } ).includes(s_programme.remoteId)
            }
        }).map(e => { return {id: e.id.toString()} })

        const cassette_remote_ids = strapi_cassette.is_film_cassette
        ? e_cassette.film_info.texts.logline.split(',').map(id => id.trim())
        : [e_cassette.ids.system_id.toString()]

        let film_order_in_cassette = 1
        strapi_cassette.orderedFilms = cassette_remote_ids.map(remote_id => {
            return (STRAPIDATA.Film.filter(s_film => remote_id === s_film.remoteId)[0] || {id: null}).id
        }).map(id => {
            return {order: film_order_in_cassette++, film: {id: id}}
        })

        if (e_cassette.publications) {
            const publications = e_cassette.publications
            for (const [lang, publication] of Object.entries(publications)) {
                if ('synopsis_long' in publication) {
                    strapi_cassette.synopsis = strapi_cassette.synopsis || {}
                    strapi_cassette.synopsis[lang] = publication.synopsis_long
                }
            }
        }

        // kas lugeda e infost kohalt e_film.film_info.submitter.companies ?
        // e_cassette.presenter = STRAPIDATA.Organisation.filter((s_presenter) =>{
        //     if(e_film.film_info && e_film.film_info.submitter && e_film.film_info.submitter.companies ){
        //         return e_film.film_info.submitter.companies.map( item => { return item.companies ).includes(s_presenter.name.en)
        //     }
        // }).map(e => { return {id: e.id.toString()} })


        // ----   END update strapi cassette properties
        to_strapi_cassettes.push(strapi_cassette)
    }
    EVENTIVAL_REMAPPED['E_CASSETTES'] = to_strapi_cassettes
    fs.writeFileSync(path.join(DYNAMIC_PATH, 'E_CASSETTES.yaml'), yaml.safeDump(to_strapi_cassettes, { 'indent': '4' }), "utf8")

    //
    // Screenings
    //
    const strapi_screenings = await getModel('Screening')
    let to_strapi_screenings = []
    // console.log('midagi', EVENTIVAL_SCREENINGS);

    for (const e_screening of EVENTIVAL_SCREENINGS) {
        // console.log('midagi', e_screening.id);

        let strapi_screening = strapi_screenings.filter(s_screening => e_screening.id.toString() === s_screening.remoteId)[0] || false

        if (! strapi_screening) {
            console.log('Missing screening in Strapi:', JSON.stringify(e_screening.id));
            continue
        }
        if (!e_screening.film || !e_screening.film.id) {
            continue
        }
        // console.log('Update screening in Strapi:', JSON.stringify(e_screening.id));

        // ---- BEGIN update strapi screening properties

        strapi_screening.is_first_screening = e_screening.type_of_screening.includes('First Screening')



        strapi_screening.code = e_screening.code.toString().padStart(6, "0")
        strapi_screening.codeAndTitle = e_screening.code.toString().padStart(6, "0") + ' / ' + e_screening.film.title_local
        // e_screening.ticketingUrl = tuleb piletilevist !!!

        //v4ga v4givaldne ja kandiline
        let newD = new Date(e_screening.start + ET.utc2)
        strapi_screening.dateTime = newD

        // e_screening.introQaConversation =
        strapi_screening.durationTotal = e_screening.complete_duration_minutes

        strapi_screening.location = STRAPIDATA.Location.filter((s_scrLocation) => {
            if(e_screening.venue_id) {
                // console.log(e_screening.venue_id, s_scrLocation.remoteId, e_screening.venue_id.toString() === s_scrLocation.remoteId);
                return e_screening.venue_id.toString() === s_scrLocation.remoteId
            }
        }).map(s_scrLocation => s_scrLocation.id.toString())[0] || null
        if( !strapi_screening.location ){
            console.log('WARNING: location.remoteId=' + e_screening.venue_id + 'not found in locations.' )
        }

        strapi_screening.extraInfo = e_screening.additional_info

        strapi_screening.screening_types = STRAPIDATA.ScreeningType.filter((s_screeningType) => {
            if(e_screening.type_of_screening) {
                return e_screening.type_of_screening.includes(s_screeningType.name)
            }
        }).map(screening_type => screening_type.id.toString())

        // e_screening.screening_mode = ''

        strapi_screening.subtitles = STRAPIDATA.Language.filter((s_scrSubLang) => {
            if(e_screening.film && e_screening.film.subtitle_languages ) {
                let languages = e_screening.film.subtitle_languages.print.language
                languages = (Array.isArray(languages) ? languages : [languages])

                return languages.includes(s_scrSubLang.code)
            }
        }).map(subLang => subLang.id.toString())

        strapi_screening.cassette = STRAPIDATA.Cassette.filter((s_cassette) => {
            if (e_screening.film && e_screening.film.id) {
                return s_cassette.remoteId === e_screening.film.id.toString()
            }
        }).map(cassette => { return {id: cassette.id.toString()} })[0] || null

        strapi_screening.remoteId = e_screening.id.toString()
        // e_screening.is_first_screening = is_first_screening

        // ----   END update strapi screening properties
        to_strapi_screenings.push(strapi_screening)

    }

    EVENTIVAL_REMAPPED['E_SCREENINGS'] = to_strapi_screenings
    const scr_path = path.join(DYNAMIC_PATH, 'E_SCREENINGS.yaml')
    const scr_yaml = yaml.safeDump(to_strapi_screenings, { 'indent': '4' })


    fs.writeFileSync(scr_path, scr_yaml, "utf8")

    // TODO #362
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

    // screening_mode: {
    //     id: /screening-modes ei leia e infost saab info location j4rgi
    // },

}


const submitFilms = async () => {
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

    let from_strapi = []
    for (const e_film of EVENTIVAL_REMAPPED['E_FILMS']) {
        const film_from_strapi = await submitFilm(e_film)
        from_strapi.push(film_from_strapi)
    }
    return from_strapi
}

const submitCassettes = async () => {
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

    let from_strapi = []
    for (const e_cassette of EVENTIVAL_REMAPPED['E_CASSETTES']) {
        const cassette_from_strapi = await submitCassette(e_cassette)
        from_strapi.push(cassette_from_strapi)
    }
    return from_strapi
}

const submitScreenings = async () => {
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
        // console.log(options, JSON.stringify(e_screening, null, 4))
        const screening_from_strapi = await strapiQuery(options, e_screening)
        return screening_from_strapi
    }

    let from_strapi = []
    for (e_screening of EVENTIVAL_REMAPPED['E_SCREENINGS']) {
        const screening_from_strapi = await submitScreening(e_screening)
        from_strapi.push(screening_from_strapi)
    }
    return from_strapi
}

const main = async () => {
    // console.log('update Strapi')
    // await updateStrapi()
    console.log('| remap')
    await remapEventival()
    // console.log('| submit films')
    // await submitFilms()
    // console.log('| submit cassettes')
    // await submitCassettes()
    // console.log('| submit screenings')
    // await submitScreenings()
}

main()
