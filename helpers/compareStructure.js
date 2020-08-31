const yaml = require('js-yaml')
const fs   = require('fs')
const util = require('util')
const path = require('path')
const { throws } = require('assert')

process.chdir(path.dirname(__filename))

const Validate= function(strapiData, modelName){
    if (!Array.isArray(strapiData)){
        throw new Error('Data has to be a list.')
    }

    const datamodel = yaml.safeLoad(fs.readFileSync('../docs/datamodel.yaml', 'utf8'))

    if (datamodel[modelName] === undefined){
        throw new Error('Model ' + modelName + ' not in data model.')
    }

    for (const ix in strapiData) {
        Compare(datamodel[modelName], strapiData[ix], modelName + '[' + ix + ']')
    }
}

const Compare = function (lhs, rhs, path) {
    // console.log('<--', path)
    delete lhs._path
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
                // console.log(key)
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
