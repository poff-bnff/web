const http = require('http')
const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const dirPath =  path.join(__dirname, '..', 'source', '_fetchdir')

fs.mkdirSync(dirPath, { recursive: true })

const modelFile = path.join(__dirname, '..', 'docs', 'datamodel.yaml')
const DATAMODEL = yaml.safeLoad(fs.readFileSync(modelFile, 'utf8'))

for (const key in DATAMODEL) {
    if (DATAMODEL.hasOwnProperty(key)) {
        const element = DATAMODEL[key]
        if (element.hasOwnProperty('_path')) {
            element['_modelName'] = key
        }
    }
}

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
            response.setEncoding('utf8')
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
            // console.log(3)
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
            response.setEncoding('utf8')
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
                    console.log('.')
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


function TakeOutTrash (data, model, dataPath) {
    const isObject = (o) => { return typeof o === 'object' && o !== null }
    const isArray = (a) => { return Array.isArray(a) }
    const isEmpty = (p) => { return !p || p == null || p === '' || p === [] || (Object.keys(p).length === 0 && p.constructor === Object)} // "== null" checks for both null and for undefined

    // console.log('Grooming', dataPath, data)
    // console.log('Grooming', dataPath, data, model)
    // eeldame, et nii data kui model on objektid

    const keysToCheck = Object.keys(data)
    let report = {'trash':[], 'keepers':[], 'nobrainers':[]}
    for (const key of keysToCheck) {
        if (isEmpty(data[key])) { delete(data[key]); continue }
        // console.log(key, model)
        // console.log('key', key)
        if (['id', '_path', '_model'].includes(key)) {
            report.nobrainers.push(key)
            // console.log('Definately keep', key, 'in', dataPath)
            continue
        }
        if (!model.hasOwnProperty(key)) {
            report.trash.push(key)
            // console.log('Trash', key, 'in', dataPath)
            delete(data[key])
            continue
        }
        report.keepers.push(key)
        // console.log('Keep', key, 'in', dataPath, data[key])
        let nextData = data[key]
        const nextModel = model[key]

        if (isArray(nextData) ^ isArray(nextModel)) { // bitwise OR - XOR: true ^ false === false ^ true === true
            console.log('next', nextData, key)
            throw new Error('Data vs model mismatch. Both should be array or none of them.')
        }
        if (isArray(nextData) && isArray(nextModel)) {
            let filtered = []
            for (const nd of nextData) {
                // console.log('nd,', nd, key);
                if (isEmpty(nd)) {
                    // console.log(nd, 'on tyhi')
                    continue
                }
                // console.log('lisan', nd);
                filtered.push(nd)
                TakeOutTrash(nd, nextModel[0], key)
            }
            if(filtered.length == 0) {
                // console.log('on tyhi kyll');
                delete(data[key])
            } else {
                data[key] = filtered
            }
        } else if (isObject(nextData) && isObject(nextModel)) {
            TakeOutTrash(data[key], nextModel, key)
        }
    }
    // console.log('Reporting', dataPath, report)
}

const Compare = function (model, data, path) {
    // console.log('<--', path)
    if (data === null) {
        console.log(path, 'is null in data')
        return
    }
    if (Array.isArray(model)) {
        if (Array.isArray(data)) {
            // data = data.filter(function (el) { return el != null })
            for (const ix in data) {
                // console.log('foo', path, ix)
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

    // Replace every property_name in strapiData with object from searchData
    const ReplaceInModel = function(property_name, strapiData, searchData) {
        // console.log(property_name, strapiData, searchData)
        for (const element of strapiData) {
            const value = element[property_name]
            if (value === null || value === undefined) {
                element[property_name] = null
                continue
            }

            // kui nt toimetaja on kustutanud artikli, millele mujalt viidatakse
            if (value.constructor === Object && Object.keys(value).length === 0) {
                element[property_name] = null
                continue
            }


            const element_id = (value.hasOwnProperty('id') ? value.id : value)
            element[property_name] = searchData.find(element => element.id === element_id)
        }
    }

    const token = await strapiAuth()
    let strapiData = {}
    // datamodel on meie kirjeldatud andmemudel
    // otsime sellest mudelist ühte mudelit =model
    //
    // Esimese sammuna 1. rikastame Strapist tulnud andmeid, mis liigse sygavuse tõttu on jäänud tulemata.
    // Rikastame kõiki alamkomponente, millel mudelis on _path defineeritud
    //
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
                // console.log('done replacing', modelName)
            }
        }
    }


    for (const modelName in strapiData) {
        if (strapiData.hasOwnProperty(modelName)) {
            const modelData = strapiData[modelName]
            for (const ix in modelData) {
                if (modelData.hasOwnProperty(ix)) {
                    let element = modelData[ix]
                    // 2. kustutame andmetest kõik propertid, mida mudelis pole
                    TakeOutTrash(element, DATAMODEL[modelName], modelName)

                    // 3. valideerime kõike, mis mudelis on kirjeldatud
                    // console.log('XXXX+X+X+X+X', DATAMODEL[modelName], element, modelName)
                    Compare(DATAMODEL[modelName], element, modelName)
                    // console.log('Validated ', modelName, ix, element['id'])
                }
            }
        }
    }

    let yamlStr = yaml.safeDump(JSON.parse(JSON.stringify(strapiData)), { 'noRefs': true, 'indent': '4' })
    // let yamlStr = yaml.safeDump(strapiData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', yamlStr, 'utf8')

}

foo()

// const testdata =
//       {
//         "id": 12,
//         "person": {
//           "id": 22,
//           "firstName": "Elin",
//           "lastName": "Laikre",
//           "gender": 3,
//           "eMail": "elin.laikre@poff.ee"
//         },
//         "roleAtTeam_et": "Raamatupidaja",
//         "roleAtTeam_en": "Accountant",
//         "roleAtTeam_ru": "Бухгалтер",
//         "emailAtTeam": "elin.laikre@poff.ee",
//         "order": 5,
//         "pictureAtTeam": [
//           {
//           }
//         ]
//       }

// TakeOutTrash(testdata, DATAMODEL['TeamMember'], 'root')

// console.log(testdata);
