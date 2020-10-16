const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const { create } = require('xmlbuilder2');
const sourceDir = path.join(__dirname, '..', 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const assetsDirXML = path.join(sourceDir, '..', 'assets', 'xml')
const XMLpath = path.join(assetsDirXML, 'xml.xml')

var languages = {'et': 'EST', 'ru': 'RUS', 'en': 'ENG'}

const SCREENINGS_YAML = path.join(fetchDir, `screenings_for_xml.yaml`)
const SCREENINGS = yaml.safeLoad(fs.readFileSync(SCREENINGS_YAML, 'utf8'))

let data = {'info': {'concerts': {'concert': []}}}

for (const screeningIx in SCREENINGS) {
    const screening = SCREENINGS[screeningIx]
    var languages = ['et', 'en', 'ru']
    var langs = {'et': 'EST', 'ru': 'RUS', 'en': 'ENG'}


    if (screening.ticketingId) {
        let concert = {}
        let id = screening.ticketingId
        concert.ticketingId = id
        for (const lang of languages) {
            if (screening.cassette && screening.cassette.films && screening.cassette.films.length > 1) {
                if (screening.cassette.synopsis && screening.cassette.synopsis[lang]) {
                    var synopsis = screening.cassette.synopsis[lang] ? screening.cassette.synopsis[lang] : undefined
                }
            } else if (screening.cassette && screening.cassette.films && screening.cassette.films && screening.cassette.films.length === 1) {
                if (screening.cassette.films[0].synopsis[lang]) {
                    var synopsis = (screening.cassette.films && screening.cassette.films[0] && screening.cassette.films[0].synopsis[lang]) ? screening.cassette.films[0].synopsis[lang] : undefined
                }
            }
            if (synopsis !== undefined) {
                concert[`description${langs[lang]}`] = synopsis
            }
        }


        if (screening.cassette && screening.cassette.films) {
            if (screening.cassette.films.length > 1) {
                if (screening.cassettePostersCassette && screening.cassettePostersCassette.length) {
                    concert.image = screening.cassettePostersCassette[0]
                } else if (screening.cassetteCarouselPicsCassette && screening.cassetteCarouselPicsCassette[0]) {
                    concert.image = screening.cassetteCarouselPicsCassette[0]
                } else if (screening.cassettePostersFilms && screening.cassettePostersFilms[0]) {
                    concert.image = screening.cassettePostersFilms[0]
                } else if (screening.cassetteCarouselPicsFilms && screening.cassetteCarouselPicsFilms[0]) {
                    concert.image = screening.cassetteCarouselPicsFilms[0]
                }
            } else if (screening.cassette.films.length === 1) {
                if (screening.cassettePostersFilms && screening.cassettePostersFilms[0]) {
                    concert.image = screening.cassettePostersFilms[0]
                } else if (screening.cassetteCarouselPicsFilms && screening.cassetteCarouselPicsFilms[0]) {
                    concert.image = screening.cassetteCarouselPicsFilms[0]
                }
            }
        }


        if (concert) {
            // const item = root.ele('data');
            // item.att('x', concert);
            data.info.concerts.concert.push(concert)

        }


    }
}

const doc = create(data);
const xml = doc.end({ prettyPrint: true });
// console.log(xml);
fs.mkdirSync(assetsDirXML, {recursive: true})
fs.writeFileSync(XMLpath, xml, 'utf8')

console.log('assets/xml/xml.xml created');

//- Mitmefilmikassett PL jaoks siis kasseti P ja kui seda pole siis kasseti F, ja kui neid pole siis suvalise filmi P ja kui seda pole siis suvalise filmi F

//- poster picture ja kui pole, siis esimene still
//- synopsis 3 keeles
//- igas keeles synopsis ja synopsise lõppu kasseti url
//- Kui mitmefilmikassett, näitame kasseti pilti K algusega, kui K algusega ei leia siis suvalise F algusega
//-
