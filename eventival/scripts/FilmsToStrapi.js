const http = require('http')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const { strapiAuth } = require("../../helpers/strapiAuth.js")
// const { PutOneToStrapi } = require('../../helpers/strapi/ToStrapi.js')


const films_fn = path.join(__dirname, '../dynamic/films.yaml')
const yamlStr = fs.readFileSync(films_fn)

const FILMS_API = 'http://139.59.130.149/films'

const eventivalFilms = (yaml.safeLoad(yamlStr).map(film => {
    let filmOut = {
        filmId: film.ids.system_id.toString(),
        title_et: film.titles.title_local,
        title_en: film.titles.title_english,
        title_ru: film.titles.title_custom,
        titleOriginal: film.titles.title_original,
        year: film_info.completion_date.year,
        runtime: film.film_info.runtime.seconds / 60,


    }

    return filmOut
}))


const post_film = async (options, e_film) => {
    options.path = FILMS_API
    options.method = 'POST'

    const response = await strapiQuery(options, e_film)
    // console.log(response);
}

const update_film = async (options, e_film) => {
    options.path = FILMS_API + '/' + e_film.id
    options.method = 'PUT'

    const response = await strapiQuery(options, e_film)
    // console.log(response);
}

const foo = async () => {
    const token = await strapiAuth()

    for (const ix in eventivalFilms) {
        if (ix > 5) {
            continue
        }
        const e_film = eventivalFilms[ix];
        const api = FILMS_API + '?filmId=' + e_film.filmId
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
        if(strapiFilm.length) {
            e_film['id'] = strapiFilm[0].id
            await update_film(options, e_film)
        } else {
            await post_film(options, e_film)
        }
    }
}

function strapiQuery(options, dataObject = false) {
    console.log('Querying', options.method, options.path);
    return new Promise((resolve, reject) => {

        const request = http.request(options, (response) => {
            response.setEncoding('utf8')
            let allData = ''
            response.on('data', function (chunk) {
                allData += chunk
            })
            response.on('end', function () {
                if (response.statusCode === 200) {
                    let strapiData = JSON.parse(allData)

                    resolve(strapiData)
                } else {
                    console.log('Status', response.statusCode)
                    resolve([])
                }
            })
            response.on('error', function (thisError) {
                console.log('E', thisError)
                reject(thisError)
            })
        })
        request.on('error', reject)
        if (dataObject) {
            request.write(JSON.stringify(dataObject));
        }

        request.end()
    })
}

foo()
