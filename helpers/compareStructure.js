const yaml = require('js-yaml')
const fs   = require('fs')
const util = require('util')
const path = require('path')

process.chdir(path.dirname(__filename))

const findModelName= function(dataPath){
    let modelName = ''
    switch(dataPath){
        case '/articles':
            modelName= 'Article'
            break
        case '/films':
            modelName= 'Film'
            break
        case '/countries':
            modelName= 'Country'
            break
        case '/languages':
            modelName= 'Language'
            break
        case 'festival-editions':
            modelName= 'FestivalEdition'
            break
        case 'locations':
            modelName= 'Location'
            break
        case 'people':
            modelName= 'Person'
            break
        case 'screenings':
            modelName= 'Screening'
            break
        case 'teams':
            modelName= 'Team'
        default:
            console.log('Not Found')
    }
    return modelName
}

const Validate= function(strapiData, dataPath){
    // console.log(dataPath)
    const datamodel = yaml.safeLoad(fs.readFileSync('../docs/datamodel.yaml', 'utf8'))
    const modelName= findModelName(dataPath)
    // console.log(modelName)
    let lhs = datamodel[modelName]
    let rhs = strapiData
    for (const ix in rhs) {
        Compare(lhs, rhs[ix], modelName + '[' + ix + ']')
    }
}

const Compare = function (lhs, rhs, path) {
    // console.log('<--', path)
    if (Array.isArray(lhs)) {
        if (Array.isArray(rhs)) {
            for (const ix in rhs) {
                Compare(lhs[0], rhs[ix], path + '[' + ix + ']')
            }
        } else {
            console.log('- Not an array:', path)
        }
    } else {
        for (const key in lhs) {
            let next_path = path + '.' + key
            if (rhs === null) {
                console.log(next_path, 'is null in data')
                return
            }
            const lh_element = lhs[key]
            if (key in rhs) {
                if (lh_element !== null && typeof(lh_element) === 'object' ) {
                    Compare(lh_element, rhs[key], next_path)
                }
            } else {
                console.log('- Missing key:', next_path)
            }
        }
    }
    // console.log('-->', path)
}

module.exports.Validate = Validate
