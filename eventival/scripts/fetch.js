const https = require('https')
const fs = require('fs')
var parser = require('fast-xml-parser');
const yaml = require('js-yaml')
const path = require('path')

const dynamicDir =  path.join(__dirname, '..', 'dynamic')

const EVENTIVAL_TOKEN = process.env['EVENTIVAL_TOKEN']
const eventivalAPI = 'bo.eventival.com/poff/23/en/ws'

const dataMap = {
    'venues': {
        'api': 'venues.xml',
        'outxml': path.join(dynamicDir, 'venues.xml'),
        'outyaml': path.join(dynamicDir, 'venues.yaml'),
        'root': 'venues',
        'iterator': 'venue'
    },
    'films': {
        'api': 'films/publications-locked.xml',
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
        console.log('go for', model);
        const eventivalXML = await eventivalFetch(mapping.api)
            .catch(e => {
                console.log('E3:', e)
            })
        // console.log('eventivalXML', eventivalXML)

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
        };

        if( parser.validate(eventivalXML) === true) { //optional (it'll return an object in case it's not valid)
            var jsonList = parser.parse(eventivalXML, options)[mapping.root][mapping.iterator]
            let yamlStr = yaml.safeDump(jsonList, { 'indent': '4' });
            fs.writeFileSync(mapping.outyaml, yamlStr)
        }

    }
}

foo()
