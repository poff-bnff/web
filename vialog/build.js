const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const { getModel } = require("../helpers/strapiQuery.js")

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))
const vialog_json_path = path.join(__dirname, 'vialog.json')
const vialog_yaml_path = path.join(__dirname, 'vialog.yaml')

getModel('Film').then(films => {
    const vialogUrls = films.map(film => {
        return {
            id: film.id,
            urls: [].concat(
                DOMAIN_SPECIFICS.vialogUrls.et
                    .filter( () => film.slug_et )
                    .map( base => `${base + film.slug_et}/`),
                DOMAIN_SPECIFICS.vialogUrls.en
                    .filter( () => film.slug_en )
                    .map( base => `${base + film.slug_en}/`),
                DOMAIN_SPECIFICS.vialogUrls.ru
                    .filter( () => film.slug_ru )
                    .map( base => `${base + film.slug_ru}/`)
            )
        }
    })
    fs.writeFileSync(vialog_json_path, JSON.stringify(vialogUrls, null, 4), 'utf8')
    fs.writeFileSync(vialog_yaml_path, yaml.safeDump(vialogUrls, { 'noRefs': true, 'indent': '4' }), 'utf8')
})
