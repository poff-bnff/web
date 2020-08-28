const yaml = require('js-yaml')
const fs   = require('fs')
const util = require('util')
const path = require('path')

process.chdir(path.dirname(__filename))

const findModelName= function(dataPath){
    if (dataPath == '/people'){
        return modelName= "Person"
    }else {
        let modelName = dataPath.slice(1, dataPath.length-1)
        return modelName = modelName[0].toUpperCase() + modelName.substring(1)
    }

}

const Validate= function(strapiData, dataPath){
    // console.log(dataPath)
    const datamodel = yaml.safeLoad(fs.readFileSync('../docs/datamodel.yaml', 'utf8'))
    const modelName= findModelName(dataPath)

    let lhs = datamodel[modelName]
    //console.log(lhs)

    if (lhs === undefined){
        console.log('Model name ' + modelName +' not found in datamodel.yaml')
    }else{
        let rhs = strapiData
        for (const ix in rhs) {
            Compare(lhs, rhs[ix], modelName + '[' + ix + ']')
        }
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
