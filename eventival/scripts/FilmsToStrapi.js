const http = require('http')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const { strapiAuth } = require("../../helpers/strapiAuth.js")
const { PutOneToStrapi } = require('../../helpers/strapi/ToStrapi.js')


const films_fn = path.join(__dirname, '../dynamic/films.yaml')
const yamlStr = fs.readFileSync(films_fn)
const films = yaml.safeLoad(yamlStr)

const api = 'http://139.59.130.149/films?filmId='

const strapiFilms = (films.map(film => {
    let filmOut = {
        filmId: film.ids.system_id,
        title_et: film.titles.title_local,
        title_en: film.titles.title_english,
        title_ru: film.titles.title_custom,
        titleOriginal: film.titles.title_original
    }

    return filmOut
}))

console.log(strapiFilms[0]['filmId']);

const foo = async () => {
    const token = await strapiAuth()
    console.log('token', token);
    // 620731

    for (const ix in strapiFilms) {
        const film = strapiFilms[ix];

        let options = {
            host: process.env['StrapiHost'],
            path: api + film.filmId,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }
        const resp = await strapiFetch(options)
        if(resp['id']){
            Put
        }
        console.log('res', resp['id'])
    }
}

function strapiFetch(options) {
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
                    console.log(response.statusCode)
                    resolve([])
                }
            })
            response.on('error', function (thisError) {
                console.log(thisError)
                reject(thisError)
            })
        })
        request.on('error', reject)
        request.end()
    })
}

foo()

console.log();
// let objectsToSEND = JSON.parse(strapiFilms)
// let objectsInStrapi = JSON.parse(strapiFetch)



