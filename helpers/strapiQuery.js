const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const http = require('http')
const { strapiAuth } = require('./strapiAuth.js')

const STRAPI_URL = process.env['StrapiHost']
console.log(__dirname)
const DATAMODEL_PATH = path.join(__dirname, '..', 'docs', 'datamodel.yaml')
console.log(DATAMODEL_PATH)
const DATAMODEL = yaml.safeLoad(fs.readFileSync(DATAMODEL_PATH, 'utf8'))

var TOKEN = ''

async function strapiQuery(options, dataObject = false) {
    if (TOKEN === '') {
        TOKEN = await strapiAuth() // TODO: setting global variable is no a good idea
        console.log('Bearer', TOKEN)
    }
    options.headers['Authorization'] = `Bearer ${TOKEN}`
    options['host'] = process.env['StrapiHost']

    // console.log(options, JSON.stringify((dataObject) || ''))
    return new Promise((resolve, reject) => {
        process.stdout.write({GET:'?', PUT:'+', POST:'o', DELETE:'X'}[options.method])
        const request = http.request(options, (response) => {
            response.setEncoding('utf8')
            let allData = ''
            response.on('data', function (chunk) {
                allData += chunk
            })
            response.on('end', function () {
                if (response.statusCode === 200) {
                    resolve(JSON.parse(allData))
                } else {
                    console.log('Status', response.statusCode, JSON.stringify((dataObject) || ''))
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
            request.write(JSON.stringify(dataObject))
        }

        request.end()
    })
}

async function getModel(model) {
    if (! model in DATAMODEL) {
        console.log('WARNING: no such model: "', model, '".' )
        return false
    }
    if (! '_path' in DATAMODEL[model]) {
        console.log('WARNING: no path to model: "', model, '".' )
        return false
    }

    const _path = `http://${STRAPI_URL}${DATAMODEL[model]['_path']}`
    const options = {
        headers: { 'Content-Type': 'application/json' },
        path: _path + '?_limit=-1',
        method: 'GET'
    }
    // console.log('=== getModel', options)
    return await strapiQuery(options)
}

async function putModel(model, data) {
    if (! model in DATAMODEL) {
        console.log('WARNING: no such model: "', model, '".' )
        return false
    }
    if (! '_path' in DATAMODEL[model]) {
        console.log('WARNING: no path to model: "', model, '".' )
        return false
    }

    const _path = `http://${STRAPI_URL}${DATAMODEL[model]['_path']}`
    let results = []
    for (const element of data) {
        const options = {
            headers: { 'Content-Type': 'application/json' },
            path: _path + '/' + element.id,
            method: 'PUT'
        }
        // console.log('=== putModel', options, element)
        results.push(await strapiQuery(options, element))
    }
    return results
}

exports.strapiQuery = strapiQuery
exports.getModel = getModel
exports.putModel = putModel
