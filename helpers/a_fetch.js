const http = require('http')
const fs = require('fs')
const util = require('util')
const { resolve } = require('path')
const yaml = require('js-yaml')

const DATAMODEL = yaml.safeLoad(fs.readFileSync(__dirname + '/../docs/minimodel.yaml', 'utf8'))

// console.log(__dirname);
async function strapiAuth() {

    return new Promise((resolve, reject) => {
        const postData = {
            identifier: process.env['StrapiUserName'],
            password: process.env['StrapiPassword']
        }

        const options = {
            hostname: process.env['StrapiHost'],
            path: '/auth/local',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const request = http.request(options, (response) => {

            let tokenStr = ''
            response.on('data', function (chunk) {
                tokenStr += chunk
            })

            response.on('end', function () {
                tokenStr = JSON.parse(tokenStr)['jwt']
                resolve(tokenStr)
            })

        })

        request.on('error', reject)
        request.write(JSON.stringify(postData))
        request.end()
    })
}

async function strapiFetch(modelName, token){

    if (DATAMODEL[modelName] === undefined){
        throw new Error('Model ' + modelName + ' not in data model.')
    }
    if (! '_path' in DATAMODEL[modelName]) {
        throw new Error ('Missing _path in model')
    }
    let dataPath = DATAMODEL[modelName]['_path']

    return new Promise((resolve, reject) => {
        let options = {
            host: process.env['StrapiHost'],
            path: dataPath +'?_limit=-1',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }

        const request = http.request(options, (response) => {
            let allData = ''
            response.on('data', function (chunk) {
                allData += chunk
            })
            response.on('end', function () {
                if (response.statusCode === 200) {
                    resolve(JSON.parse(allData))
                } else {
                    console.log(response.statusCode)
                    resolve([])
                }
            })
            response.on('error', function (thisError) {
                console.log(thisError);
                reject(thisError)
            })
        })
        request.on('error', reject)
        request.end()

    })
}



const foo = async () => {
    const token = await strapiAuth()
    let strapiData = {}

    for (const modelName in DATAMODEL) {
        if (DATAMODEL.hasOwnProperty(modelName)) {
            let model = DATAMODEL[modelName]
            if (model.hasOwnProperty('_path')) {
                strapiData[modelName] = await strapiFetch(modelName, token)
                console.log('Fetched ', modelName)
            }
        }
    }
    // console.log(token)
    console.log(util.inspect(strapiData));
}

foo()
