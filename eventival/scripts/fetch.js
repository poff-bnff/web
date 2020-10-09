const https = require('https')
const fs = require('fs')
var parser = require('fast-xml-parser');
const yaml = require('js-yaml')
const path = require('path')
const readline = require('readline');

const dynamicDir =  path.join(__dirname, '..', 'dynamic')

const EVENTIVAL_TOKEN = process.env['EVENTIVAL_TOKEN']
const edition = '24'
const eventivalAPI = path.join('bo.eventival.com', 'poff', edition, 'en', 'ws')

const categories = [
    { "id": 9, "name": "Just Film" },
    { "id": 10, "name": "PÖFF" },
    { "id": 1838, "name": "Shortsi alam" },
    { "id": 1839, "name": "Shorts" },
    { "id": 2651, "name": "KinoFF" }
]

const dataMap = {
    'venues': {
        'api': 'venues.xml',
        'outyaml': path.join(dynamicDir, 'venues.yaml'),
        'root': 'venues',
        'iterator': 'venue'
    },
    'films': {
        'api': 'films/',
        'category': 'categories/?/films.xml',
        'outyaml': path.join(dynamicDir, 'films.yaml'),
        'root': 'films',
        'iterator': 'item'
    },
    // 'films': {
    //     'api': 'films/publications-locked.xml',
    //     'outyaml': path.join(dynamicDir, 'films.yaml'),
    //     'root': 'films',
    //     'iterator': 'item'
    // },
    'screenings': {
        'api': 'films/screenings.xml',
        'outyaml': path.join(dynamicDir, 'screenings.yaml'),
        'root': 'screenings',
        'iterator': 'screening'
    }
}

// const filmsO = yaml.safeLoad(fs.readFileSync(path.join(dynamicDir, 'films.yaml'))).map( film => {
//     if (film.eventival_categorization && film.eventival_categorization.sections && film.eventival_categorization.sections.section) {
//         for (const section of film.eventival_categorization.sections.section) {
//             console.log(section);
//         }
//     } else {
//         return ''
//     }
// })
// console.log(filmsO)




async function eventivalFetch(url) {
    // console.log('Fetch', modelName)
    return new Promise((resolve, reject) => {
        // console.log('url', url);
        https.get(url, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            // console.log(statusCode);
            let error
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
                console.log('headers', res.headers);
            } else if (!/^text\/xml/.test(contentType)) {
                error = new Error('Invalid content-type.\n' + `Expected text/xml but received ${contentType}`);
            }

            if (error) {
                console.error('E1', error.message)
                // Consume response data to free up memory
                res.resume()
                return
            }

            res.setEncoding('utf8')
            let rawData = ''
            res.on('data', (chunk) => { rawData += chunk })
            res.on('end', () => {
                resolve(rawData)
            })
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`)
        })
    })
}

const fetch_lists = async () => {
    let e_data = {}

    for (const [model, mapping] of Object.entries(dataMap)) {
        console.log('go for', model, 'list')
        let eApis = []
        let jsonList = []
        if (mapping.category) {
            for (const category of categories) {
                eApis.push(mapping.api + mapping.category.replace('?', category.id))
            }
        } else {
            eApis.push(mapping.api)
        }
        for (const eApi of eApis) {
            // console.log(eApi);
            const url = 'https://' + path.join(eventivalAPI, EVENTIVAL_TOKEN, eApi)
            const eventivalXML = await eventivalFetch(url)
                .catch(e => {
                    console.log('E3:', e)
                })
            // console.log('eventivalXML', eventivalXML)
            const fetched = my_parser(eventivalXML, mapping.root);
            if (Object.keys(fetched).includes(mapping.iterator)) {
                jsonList = jsonList.concat(fetched[mapping.iterator])
            }
        }
        e_data[model] = jsonList
    }
    return e_data
}

const makeList = (obj, keep_prop, list_prop) => {
    const list_a = obj[keep_prop][list_prop]
    if (list_a === undefined) {
        return
    }
    if (Array.isArray(list_a)) {
        obj[keep_prop] = obj[keep_prop][list_prop]
    } else {
        obj[keep_prop] = [obj[keep_prop][list_prop]]
    }
}

const fetch_films = async (e_films) => {
    const endlineAt = 60
    for (const [ix, element] of Object.entries(e_films)) {
        // if (ix > 50) { continue }
        // console.log('fetch', element.id, element.title_english, element.title_original)
        const url = 'https://' + path.join(eventivalAPI, EVENTIVAL_TOKEN, 'films/' + element.id + '.xml')
        const eventivalXML = await eventivalFetch(url)
        .catch(e => {
            console.log('E4:', e)
        })
        e_films[ix] = my_parser(eventivalXML, 'film')
        makeList(e_films[ix].film_info, 'languages', 'language')
        makeList(e_films[ix].film_info, 'subtitle_languages', 'subtitle_language')
        makeList(e_films[ix].film_info, 'types', 'type')
        makeList(e_films[ix].film_info, 'countries', 'country')
        makeList(e_films[ix].film_info.relationships, 'directors', 'director')
        makeList(e_films[ix].film_info.relationships, 'cast', 'cast')
        makeList(e_films[ix].eventival_categorization, 'categories', 'category')
        makeList(e_films[ix].eventival_categorization, 'sections', 'section')
        makeList(e_films[ix].eventival_categorization, 'tags', 'tag')

        const cursor_x = parseInt(ix)%endlineAt
        const dot = (ix%10 ? (ix%5 ? '.' : 'i') : '|')
        if (cursor_x === 0 && parseInt(ix) !== 0) {
            readline.cursorTo(process.stdout, endlineAt)
            console.log(dot + ' = ' + ix)
        }
        readline.cursorTo(process.stdout, cursor_x)
        process.stdout.write(dot + ' (' + ix + ')')

        readline.cursorTo(process.stdout, cursor_x + 1)
    }
    process.stdout.write(' = ' + e_films.length + '\n')

}

const foo = async () => {
    const e_data = await fetch_lists()
    console.log('go for all the films ');
    await fetch_films(e_data.films)
    for (const [model, data] of Object.entries(e_data)) {
        const yamlStr = yaml.safeDump(data, { 'indent': '4' })
        fs.writeFileSync(dataMap[model].outyaml, yamlStr, "utf8")
    }
}

function my_parser(eventivalXML, root_node) {
    if (parser.validate(eventivalXML) !== true) { //optional (it'll return an object in case it's not valid)
        process.exit(1)
    }
    var options = {
        attributeNamePrefix: "@_",
        attrNodeName: "attr",
        textNodeName: "#text",
        ignoreAttributes: true,
        ignoreNameSpace: false,
        allowBooleanAttributes: false,
        parseNodeValue: true,
        parseAttributeValue: false,
        trimValues: true,
        cdataTagName: "__cdata",
        cdataPositionChar: "\\c",
        parseTrueNumberOnly: false,
        arrayMode: false,
        stopNodes: ["parse-me-as-string"]
    }
    return parser.parse(eventivalXML, options)[root_node]
}

foo()
