const yaml = require('js-yaml')
const fs   = require('fs')
const util = require('util')
const path = require('path')

process.chdir(path.dirname(__filename))

const FromStrapi = require('./strapi/FromStrapi')

const datamodel = yaml.safeLoad(fs.readFileSync('../docs/datamodel.yaml', 'utf8'))

FromStrapi.Fetch('/articles', function(strapiObject){
    const data_path = 'Article'
    let lhs = datamodel[data_path]
    let rhs = strapiObject
    fs.writeFileSync('test.json', JSON.stringify(strapiObject, null, 4));

    // console.log('lhs', util.inspect(lhs))
    // console.log('rhs', util.inspect(rhs))
    for (const ix in rhs) {
        compare(lhs, rhs[ix], data_path + '[' + ix + ']')
    }
})

const compare = function (lhs, rhs, path) {
    // console.log('<--', path)
    if (Array.isArray(lhs)) {
        if (Array.isArray(rhs)) {
            for (const ix in rhs) {
                compare(lhs[0], rhs[ix], path + '[' + ix + ']')
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
                    compare(lh_element, rhs[key], next_path)
                }
            } else {
                console.log('- Missing key:', next_path)
            }
        }
    }
    // console.log('-->', path)
}

