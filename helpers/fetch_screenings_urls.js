const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const request = require('request');
const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const { strapiQuery } = require("./strapiQuery.js")
const STRAPI_URL = process.env['StrapiHost']
const SCREENINGS_API = `${STRAPI_URL}/screenings`

async function main() {

    // let optionsStrapi =  {
    //     headers: { 'Content-Type': 'application/json' },
    //     path: SCREENINGS_API + '?id=1',
    //     method: 'GET'
    // }
    // // let screenings = await strapiQuery(options, strapi_screening)
    // let screenings = await strapiQuery(optionsStrapi)

    var optionsPL = {
        'method': 'GET',
        'url': 'http://www.piletilevi.ee/api/?preset=pff&language=est',
        'headers': {}
    };

    request(optionsPL, async function (error, response) {
        if (error) throw new Error(error);

        if (response.body === undefined) {
            var YAML = yaml.safeDump([], { 'noRefs': true, 'indent': '4' })
        } else {
            var jsonData = JSON.parse(response.body).responseData.concert
            let allScreeningInfo = []
            for (iX in jsonData) {
                let oneScreeningInfo = {}
                let item = jsonData[iX]
                for (key in item) {
                    if (key === 'decoratedTitle') {
                        oneScreeningInfo.codeAndTitle = item[key]
                        oneScreeningInfo.code = item[key].split(' / ')[0]
                    }
                    if (key === 'shopUrl') {
                        oneScreeningInfo.ticketingUrl = item[key]
                    }
                    if (key === 'id') {
                        oneScreeningInfo.ticketingId = item[key]
                    }
                    if (key === 'salesTime') {
                        oneScreeningInfo.salesTime = item[key]
                    }
                }
                allScreeningInfo.push(oneScreeningInfo)
            }
            if (allScreeningInfo) {
                var YAML = yaml.safeDump(allScreeningInfo, { 'noRefs': true, 'indent': '4' })
            }
        }
        if (YAML !== undefined) {

            // let yamlKeys = YAML.keys()
            const outFile = path.join(fetchDir, `screenings_urls.yaml`)
            fs.writeFileSync(outFile, YAML, 'utf8')
        }
    });
}

main()
