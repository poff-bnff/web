const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const request = require('request');
const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const { getModel, putModel } = require("./strapiQuery.js")

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
    let PL_screenings = []
    request(optionsPL, async function (error, response) {
        if (error) throw new Error(error);

        if (response.body === undefined) {
            yaml.safeDump([], { 'noRefs': true, 'indent': '4' })
        } else {
            const concerts = JSON.parse(response.body).responseData.concert
            PL_screenings = concerts.map(concert => {
                return {
                    codeAndTitle: concert.decoratedTitle || null,
                    code: concert.decoratedTitle ? concert.decoratedTitle.split(' / ')[0] : null,
                    ticketingUrl: concert.shopUrl || null,
                    ticketingId: concert.id.toString() || null,
                    // salesTime: concert.salesTime || null
                }
            }).filter(PL_screening => PL_screening.code !== null)
            // var YAML = yaml.safeDump(PL_screenings, { 'noRefs': true, 'indent': '4' })
            // const outFile = path.join(fetchDir, `screenings_urls.yaml`)
            // fs.writeFileSync(outFile, YAML, 'utf8')
        }
    })
    // console.log(null === null)
    const s_screenings = await getModel('Screening')

    for (const PL_screening of PL_screenings) {
        let s_screening = s_screenings.filter(s_screening => {
            // console.log(s_screening.remoteId, PL_screening.remoteId.toString())
            return s_screening.code === PL_screening.code
        })[0] || {code: null}
        PL_screening.id = s_screening.id
    }

    const outFile = path.join(fetchDir, `screenings_urls.yaml`)
    fs.writeFileSync(outFile, JSON.stringify(PL_screenings, null, 4), 'utf8')



    await putModel('Screening', PL_screenings)
}

main()
