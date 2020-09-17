const http = require('http')
const fs = require('fs')
const util = require('util')
const { resolve } = require('path')
const yaml = require('js-yaml')
const path = require('path');

const dirPath =  path.join(__dirname, '../source/_fetchdir/');

fs.mkdirSync(dirPath, { recursive: true })

const DATAMODEL = yaml.safeLoad(fs.readFileSync(__dirname + '/../docs/datamodel.yaml', 'utf8'))
for (const key in DATAMODEL) {
    if (DATAMODEL.hasOwnProperty(key)) {
        const element = DATAMODEL[key]
        if (element.hasOwnProperty('_path')) {
            element['_modelName'] = key
        }
    }
}
// todo:
// luua _modelname property

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

    let checkDomain = function(element){
        // kui on domain, siis element['domains'] = [domain]
        if (element['domain']){
            element['domains'] = [element['domain']]
        }

        if (element['domains'] === undefined) {
            // console.log(3);
            return true
        }

        for(let ix in element['domains']){
            let el = element['domains'][ix]
            // console.log(ix, el)
            if (el['url'] === process.env['DOMAIN']){
                return true
            }
        }

        return false
    }

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

        process.stdout.write('Fetching ' + modelName + ' ')

        const request = http.request(options, (response) => {
            let allData = ''
            response.on('data', function (chunk) {
                allData += chunk
                process.stdout.write('.')
            })
            response.on('end', function () {
                if (response.statusCode === 200) {
                    let strapiData = JSON.parse(allData)

                    if (!Array.isArray(strapiData)){
                        strapiData = [strapiData]
                    }

                    strapiData = strapiData.filter(checkDomain)
                    resolve(strapiData)
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

// lhs == model, rhs == data
const Compare = function (model, data, path) {
    // console.log('<--', path)
    if (data === null) {
        console.log(path, 'is null in data')
        return
    }
    if (Array.isArray(model)) {
        if (Array.isArray(data)) {
            for (const ix in data) {
                // console.log('foo', path, ix);
                Compare(model[0], data[ix], path + '[' + ix + ']')
            }
        } else {
            console.log('- Not an array:', path, model)
        }
    } else {
        for (const key in model) {
            if (key === '_path' || key === '_modelName') {
                continue
            }
            let next_path = path + '.' + key
            const model_element = model[key]
            if (data.hasOwnProperty(key) && data[key]) {
                if (model_element !== null && typeof(model_element) === 'object' ) {
                    Compare(model_element, data[key], next_path)
                }
            } else {
                // console.log('path', path, 'missing', key)
            }
        }
    }
    // console.log('-->', path)
}


const foo = async () => {

    const ReplaceInModel = function(property_name, modelData, searchData) {
        for (const ix in modelData) {
            const element = modelData[ix]
            if (element[property_name] === null) {
                continue
            }
            if (element[property_name] === undefined) {
                element[property_name] = null
                continue
            }

            // kui nt toimetaja on kustutanud artikli, millele mujalt viidatakse
            if (element[property_name].constructor === Object && Object.keys(element[property_name]).length === 0) {
                element[property_name] = null
                continue
            }

            let element_id = element[property_name]
            if (element_id.hasOwnProperty('id')) {
                element_id = element_id['id']
            }
            element[property_name] = searchData.find(element => element.id === element_id)
        }
    }

    const token = await strapiAuth()
    let strapiData = {}
    // datamodel on meie kirjeldatud andmemudel
    // otsime sellest mudelist ühte mudelit =model
    for (const modelName in DATAMODEL) {
        if (DATAMODEL.hasOwnProperty(modelName)) {
            let model = DATAMODEL[modelName]
            // '_path' muutujas on kirjas tee andmete küsimiseks
            if (model.hasOwnProperty('_path')) {
                let modelData = await strapiFetch(modelName, token)
                // otsime kirjet mudelis =value
                for (const property_name in model) {
                    if (model.hasOwnProperty(property_name)) {
                        const value = model[property_name]
                        // '_modelName' on üleval ise sees kirjutaud väärtus andmemudelis, mis on võrdne mudeli nimega
                        if (value.hasOwnProperty('_modelName')) {
                            let search_model_name = value['_modelName']
                            // console.log('foo', search_model_name, 'in', modelName)
                            let searchData = strapiData[search_model_name]
                            // otsime juba olemasolevast strapi datast
                            ReplaceInModel(property_name, modelData, searchData)
                        }
                    }
                }
                strapiData[modelName] = modelData
                console.log(' done')
            }
            // if (strapiData.hasOwnProperty('Country')) {
            //     console.log(strapiData['Country'][0])
            // }
        }
    }
    // console.log(token)

    for (const modelName in strapiData) {
        if (strapiData.hasOwnProperty(modelName)) {
            const modelData = strapiData[modelName]
            for (const ix in modelData) {
                if (modelData.hasOwnProperty(ix)) {
                    const element = modelData[ix]

                    // console.log('XXXX+X+X+X+X', DATAMODEL[modelName], element, modelName)
                    Compare(DATAMODEL[modelName], element, modelName)
                    // console.log('Validated ', modelName, ix, element['id'])
                }
            }
        }
    }

    let yamlStr = yaml.safeDump(strapiData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(__dirname + '/../source/strapiData.yaml', yamlStr, 'utf8')

}

foo()
