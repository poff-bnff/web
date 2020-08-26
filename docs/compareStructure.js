const yaml = require('js-yaml');
const fs   = require('fs');
const util = require('util');

const datamodel = yaml.safeLoad(fs.readFileSync(__dirname + '\\datamodel.yaml', 'utf8'));

// const strapiObject = require('../helpers/data/ISOCountriesFromStrapi.json');
// const strapiObject = require('../helpers/data/ISOLanguagesFromStrapi.json');
// const strapiObject = require('../helpers/data/FilmsFromStrapi.json');
const strapiObject = require(__dirname + '\\EXarticlestrapi.json');
// const strapiObject = require(__dirname + '\\EXhallsStrapi.json');
// const strapiObject = require(__dirname + '\\EXorgStrapi.json');

// console.log('datamodel', util.inspect(datamodel))
// console.log('strapiObject', util.inspect(strapiObject))

const PATH = 'Article';
let lhs = datamodel[PATH];
let rhs = strapiObject;

// console.log('lhs', util.inspect(lhs))
// console.log('rhs', util.inspect(rhs))

const compare = function (lhs, rhs, path) {
    if (Array.isArray(lhs)) {
        if (Array.isArray(rhs)) {
            for (const ix in rhs) {
                compare(lhs[0], rhs[ix], path + '[' + ix + ']');
            }
        } else {
            console.log('- Not an array:', path);
        }

    } else {
        for (const key in lhs) {
            if (rhs === null) {
                console.log(path + '.' + key, rhs, 'is null')
                return
            }
            const lh_element = lhs[key]
            if (key in rhs) {
                if (lh_element !== null && typeof(lh_element) === 'object' ) {
                    compare(lh_element, rhs[key], path + '.' + key);
                }
            } else {
                console.log('- Missing key:', path + '.' + key);
            }
        }
    }
    console.log('Good to go :)');
}

// compare(lhs, rhs, path=PATH);
