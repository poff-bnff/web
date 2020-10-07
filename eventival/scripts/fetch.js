const https = require('https')
const fs = require('fs')
var parser = require('fast-xml-parser');
const yaml = require('js-yaml')
const path = require('path')

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
        'outxml': path.join(dynamicDir, 'venues.xml'),
        'outyaml': path.join(dynamicDir, 'venues.yaml'),
        'root': 'venues',
        'iterator': 'venue'
    },
    'films': {
        'api': 'films/',
        'category': 'categories/?/films.xml',
        'outxml': path.join(dynamicDir, 'films.xml'),
        'outyaml': path.join(dynamicDir, 'films.yaml'),
        'root': 'films',
        'iterator': 'item'
    },
    'screenings': {
        'api': 'films/screenings.xml',
        'outxml': path.join(dynamicDir, 'screenings.xml'),
        'outyaml': path.join(dynamicDir, 'screenings.yaml'),
        'root': 'screenings',
        'iterator': 'screening'
    }
}


async function eventivalFetch(modelName) {
    console.log('Fetch', modelName)
    return new Promise((resolve, reject) => {
        const url = 'https://' + path.join(eventivalAPI, EVENTIVAL_TOKEN, modelName)
        console.log(url);
        https.get(url, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            // console.log(statusCode);
            let error
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
                console.log(res.headers);
            } else if (!/^text\/xml/.test(contentType)) {
                error = new Error('Invalid content-type.\n' + `Expected text/xml but received ${contentType}`);
            }

            if (error) {
                console.error(error.message)
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

const foo = async () => {
    for (const [model, mapping] of Object.entries(dataMap)) {
        console.log('go for', model)
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
            console.log(eApi);
            const eventivalXML = await eventivalFetch(eApi)
                .catch(e => {
                    console.log('E3:', e)
                })
            // console.log('eventivalXML', eventivalXML)
            if( parser.validate(eventivalXML) !== true) { //optional (it'll return an object in case it's not valid)
                process.exit(1)
            }
            var options = {
                attributeNamePrefix : "@_",
                attrNodeName: "attr", //default is 'false'
                textNodeName : "#text",
                ignoreAttributes : true,
                ignoreNameSpace : false,
                allowBooleanAttributes : false,
                parseNodeValue : true,
                parseAttributeValue : false,
                trimValues: true,
                cdataTagName: "__cdata", //default is 'false'
                cdataPositionChar: "\\c",
                parseTrueNumberOnly: false,
                arrayMode: false, //"strict"
                // attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
                // tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
                stopNodes: ["parse-me-as-string"]
            }
            const fetched = parser.parse(eventivalXML, options)[mapping.root]
            console.log(mapping.iterator, Object.keys(fetched));
            if (Object.keys(fetched).includes(mapping.iterator)) {
                console.log('found', mapping.iterator, Object.keys(fetched))
                jsonList = jsonList.concat(fetched[mapping.iterator])
            }
        }
        const yamlStr = yaml.safeDump(jsonList, { 'indent': '4' })
        fs.writeFileSync(mapping.outyaml, yamlStr)
    }
}

foo()
