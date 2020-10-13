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
            yaml.safeDump([], { 'noRefs': true, 'indent': '4' })
        } else {
            const concerts = JSON.parse(response.body).responseData.concert
            const screenings = concerts.map(concert => {
                return {
                    codeAndTitle: concert.decoratedTitle || null,
                    code: concert.decoratedTitle ? concert.decoratedTitle.split(' / ')[0] : null,
                    ticketingUrl: concert.shopUrl || null,
                    remoteId: concert.id || null,
                    salesTime: concert.salesTime || null
                }
            })
            var YAML = yaml.safeDump(screenings, { 'noRefs': true, 'indent': '4' })
            const outFile = path.join(fetchDir, `screenings_urls.yaml`)
            fs.writeFileSync(outFile, YAML, 'utf8')
        }
    })
}

main()
