const { strapiQuery } = require("../../helpers/strapiQuery.js")

const STRAPI_URL = 'http://139.59.130.149'
const FILMS_API = `${STRAPI_URL}/films`
const CASSETTES_API = `${STRAPI_URL}/cassettes`
const SCREENINGS_API = `${STRAPI_URL}/screenings`
const PERSONS_API = `${STRAPI_URL}/people`
const ROLES_API = `${STRAPI_URL}/role-at-films`


const STRAPI_GET_PERSONS_OPTIONS = {
    headers: { 'Content-Type': 'application/json' },
    path: PERSONS_API + '?_limit=-1',
    method: 'GET'
}
const STRAPI_UPDATE_PERSONS_OPTIONS = {
    headers: { 'Content-Type': 'application/json' },
    path: PERSONS_API + '/?',
    method: 'PUT'
}

const foo = async () => {
    strapi_persons = await strapiQuery(STRAPI_GET_PERSONS_OPTIONS)
    for (const s_person of strapi_persons) {
        s_person.firstNameLastName = (s_person.firstName || '') + ' ' + (s_person.lastName || '')
        let options = STRAPI_UPDATE_PERSONS_OPTIONS
        options.path = options.path.replace('?', s_person.id)
        await strapiQuery(options, s_person)
        console.log( s_person.firstNameLastName, '=', s_person.firstName, '+', s_person.lastName );
    }
}

foo()
