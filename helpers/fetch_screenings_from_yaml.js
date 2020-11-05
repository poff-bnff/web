const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js');

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA_SCREENINGS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Screening']
const STRAPIDATA_FILMS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Film']
const DOMAIN = process.env['DOMAIN'] || 'poff.ee';

const sourceFolder =  path.join(__dirname, '../source/');

const allLanguages = DOMAIN_SPECIFICS.locales[DOMAIN]

for (const lang of allLanguages) {
    LangSelect(lang)
}

function LangSelect(lang) {
    let data = STRAPIDATA_SCREENINGS
    processData(data, lang, CreateYAML);
    console.log(`Fetching ${DOMAIN} screenings ${lang} data`);
}

function processData(data, lang, CreateYAML) {

    const cassettesPath = path.join(fetchDir, `cassettes.${lang}.yaml`)
    const CASSETTES = yaml.safeLoad(fs.readFileSync(cassettesPath, 'utf8'))

    let allData = []
    if (STRAPIDATA_SCREENINGS.length) {
        let screeningsMissingCassetteIDs = []

        for (screeningIx in STRAPIDATA_SCREENINGS) {
            let screening = STRAPIDATA_SCREENINGS[screeningIx]
            let cassetteCarouselPicsCassette = []
            let cassetteCarouselPicsFilms = []
            let cassettePostersCassette = []
            let cassettePostersFilms = []


            if (screening.cassette) {
                let cassetteFromYAML = CASSETTES.filter( (a) => { return screening.cassette.id === a.id})

                if (cassetteFromYAML.length) {
                    STRAPIDATA_SCREENINGS[screeningIx].cassette = JSON.parse(JSON.stringify(cassetteFromYAML[0]))
                }

                let cassette = screening.cassette

                // Cassette carousel pics
                if (cassette.media && cassette.media.stills && cassette.media.stills[0]) {
                    for (const stillIx in cassette.media.stills) {
                        let still = cassette.media.stills[stillIx]
                        if (still.hash && still.ext) {
                            if (still.hash.substring(0, 4) === 'F_1_') {
                                cassetteCarouselPicsCassette.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                            }
                            cassetteCarouselPicsCassette.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                        }
                    }
                }

                if (cassetteCarouselPicsCassette.length > 0) {
                    screening.cassetteCarouselPicsCassette = cassetteCarouselPicsCassette
                }

                // Cassette poster pics
                if (cassette.media && cassette.media.posters && cassette.media.posters[0]) {
                    for (const posterIx in cassette.media.posters) {
                        let poster = cassette.media.posters[posterIx]
                        if (poster.hash && poster.ext) {
                            if (poster.hash.substring(0, 2) === 'P_') {
                                cassettePostersCassette.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                            }
                            cassettePostersCassette.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                        }
                    }
                }

                if (cassettePostersCassette.length > 0) {
                    screening.cassettePostersCassette = cassettePostersCassette
                }


                if(cassette.orderedFilms) {
                    for(filmIx in cassette.orderedFilms) {
                        let film = cassette.orderedFilms[filmIx]
                        if (film && film.film) {
                            let oneFilm = STRAPIDATA_FILMS.filter( (a) => { return film.film.id === a.id })
                            if (typeof oneFilm[0] !== 'undefined') {
                                film.film = JSON.parse(JSON.stringify(oneFilm[0]))
                            }
                            // Film carousel pics
                            if (film.film.media && film.film.media.stills && film.film.media.stills[0]) {
                                for (const stillIx in film.film.media.stills) {
                                    let still = film.film.media.stills[stillIx]
                                    if (still.hash && still.ext) {
                                        if (still.hash.substring(0, 4) === 'F_1_') {
                                            cassetteCarouselPicsFilms.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                                        }
                                        cassetteCarouselPicsFilms.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                                    }
                                }
                            }

                            if (cassetteCarouselPicsFilms.length > 0) {
                                screening.cassetteCarouselPicsFilms = cassetteCarouselPicsFilms
                            }

                            // Film posters pics
                            if (film.film.media && film.film.media.posters && film.film.media.posters[0]) {
                                for (const posterIx in film.film.media.posters) {
                                    let poster = film.film.media.posters[posterIx]
                                    if (poster.hash && poster.ext) {
                                        if (poster.hash.substring(0, 2) === 'P_') {
                                            cassettePostersFilms.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                                        }
                                        cassettePostersFilms.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                                    }
                                }
                            }

                            if (cassettePostersFilms.length > 0) {
                                screening.cassettePostersFilms = cassettePostersFilms
                            }
                        }

                    }
                }
                allData.push(STRAPIDATA_SCREENINGS[screeningIx])

            } else {
                screeningsMissingCassetteIDs.push(screening.id)
            }

        }

        if (screeningsMissingCassetteIDs.length) {
            console.log('Screenings with IDs ', screeningsMissingCassetteIDs.join(', '), ' missing cassette');
        }

    }
    CreateYAML(allData, lang);

}

function CreateYAML(screenings, lang) {

    // console.log(screenings);
    if (lang === DOMAIN_SPECIFICS.defaultLocale[DOMAIN]) {
        const SCREENINGS_YAML_XML_PATH = path.join(fetchDir, `screenings_for_xml.yaml`)

        // // console.log(process.cwd());
        if (screenings.length) {
            let allDataYAML = yaml.safeDump(screenings, { 'noRefs': true, 'indent': '4' });
            fs.writeFileSync(SCREENINGS_YAML_XML_PATH, allDataYAML, 'utf8');
        } else {
            fs.writeFileSync(SCREENINGS_YAML_XML_PATH, '[]', 'utf8');
        }
    }

    for (screening of screenings) {

        function picSplit(txt) {
            return txt.replace('assets.poff.ee/img/', 'assets.poff.ee/img/thumbnail_')
        }

        screening.cassetteCarouselPicsCassetteThumbs = (screening.cassetteCarouselPicsCassette || []).map(txt => picSplit(txt))
        screening.cassetteCarouselPicsFilmsThumbs = (screening.cassetteCarouselPicsFilms || []).map(txt => picSplit(txt))
        screening.cassettePostersCassetteThumbs = (screening.cassettePostersCassette || []).map(txt => picSplit(txt))
        screening.cassettePostersFilmsThumbs = (screening.cassettePostersFilms || []).map(txt => picSplit(txt))

    }


    const SCREENINGS_YAML_PATH = path.join(fetchDir, `screenings.${lang}.yaml`)

    let screeningsCopy = rueten(JSON.parse(JSON.stringify(screenings)), lang)

    // // console.log(process.cwd());
    let allDataYAML = yaml.safeDump(screeningsCopy, { 'noRefs': true, 'indent': '4' });
    fs.writeFileSync(SCREENINGS_YAML_PATH, allDataYAML, 'utf8');


    // FOR SEARCH BELOW
    // FOR SEARCH BELOW
    // FOR SEARCH BELOW

    let filters = {
        programmes: {},
        languages: {},
        countries: {},
        subtitles: {},
        premieretypes: {},
        towns: {},
        cinemas: {},
        dates: {},
        times: {}
    }

    const screenings_search = screeningsCopy.map(screenings => {

        let dates = []
        let times = []


        let dateTimeUTC = new Date(screenings.dateTime)
        let dateTime = dateTimeUTC.toLocaleString("et-ET"); // , {timeZone: "EET"}

        Date.prototype.addHours = function(hours) {
            var date = new Date(this.valueOf());
            date.setHours(date.getHours() + hours);
            return date;
        }

        let date = dateTimeUTC.addHours(2).toLocaleString("et-ET" , { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" });
        let dateKey = `_${date}`
        let time = dateTimeUTC.addHours(2).toLocaleString("et-ET" , { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
        let timeKey = `_${time}`


        // let date = dateTime.getFullYear() + '-' + ('0' + (dateTime.getMonth())).slice(-2) + '-' + ('0' + dateTime.getDate()).slice(-2)
        // let dateKey = `_${date}`
        // let time = ('0' + (dateTime.getHours())).slice(-2) + '-' + ('0' + dateTime.getMinutes()).slice(-2)
        // let timeKey = `_${time}`

        dates.push(dateKey)
        filters.dates[dateKey] = date
        times.push(timeKey)
        filters.times[timeKey] = time

        let programmes = []
        let cassette = screenings.cassette
        if (typeof cassette.tags.programmes !== 'undefined') {
            for (const programme of cassette.tags.programmes) {
                // console.log(programme.festival_editions, 'CASSETTE ', cassette.id);
                if (typeof programme.festival_editions !== 'undefined') {
                    for (const fested of programme.festival_editions) {
                        const key = fested.festival + '_' + programme.id
                        const festival = cassette.festivals.filter(festival => festival.id === fested.festival)
                        if (festival[0]) {
                            var festival_name = festival[0].name
                        }
                        programmes.push(key)
                        filters.programmes[key] = `${festival_name} ${programme.name}`
                    }
                }
            }
        }

        let languages = []
        let countries = []
        let cast_n_crew = []

        if (cassette.films) {
            for (const film of cassette.films) {
                for (const language of film.languages || []) {
                    const langKey = language.code
                    const language_name = language.name
                    languages.push(langKey)
                    filters.languages[langKey] = language_name
                }
                for (const country of film.orderedCountries || []) {
                    const countryKey = country.country.code
                    const country_name = country.country.name
                    countries.push(countryKey)
                    filters.countries[countryKey] = country_name
                }

                film.credentials = film.credentials || []
                try {
                    for (const key in film.credentials.rolePersonsByRole) {
                        for (const crew of film.credentials.rolePersonsByRole[key]) {
                            cast_n_crew.push(crew)
                        }
                    }
                } catch (error) {
                    console.log('bad creds on film', JSON.stringify({film: film, creds:film.credentials}, null, 4));
                    throw new Error(error)
                }
            }
        }
        let subtitles = []
        let towns = []
        let cinemas = []
        // for (const screenings of cassette.screenings) {
        for (const subtitle of screenings.subtitles || []) {
            const subtKey = subtitle.code
            const subtitle_name = subtitle.name
            subtitles.push(subtKey)
            filters.subtitles[subtKey] = subtitle_name
        }

        const townKey = `_${screenings.location.hall.cinema.town.id}`
        const town_name = screenings.location.hall.cinema.town.name
        towns.push(townKey)
        filters.towns[townKey] = town_name

        const cinemaKey = `_${screenings.location.hall.cinema.id}`
        const cinema_name = screenings.location.hall.cinema.name
        cinemas.push(cinemaKey)
        filters.cinemas[cinemaKey] = cinema_name
        // }
        let premieretypes = []
        for (const types of cassette.tags.premiere_types || []) {
                const type_name = types
                premieretypes.push(type_name)
                filters.premieretypes[type_name] = type_name
        }
        return {
            id: screenings.id,
            text: [
                cassette.title,
                cassette.synopsis,
                cast_n_crew
            ].join(' ').toLowerCase(),
            programmes: programmes,
            languages: languages,
            countries: countries,
            subtitles: subtitles,
            premieretypes: premieretypes,
            towns: towns,
            cinemas: cinemas,
            dates: dates,
            times: times
        }
    });

    function mSort(to_sort) {
        let sortable = []
        for (var item in to_sort) {
            sortable.push([item, to_sort[item]]);
        }

        sortable = sortable.sort(function(a, b) {
            try {
                const locale_sort = a[1].localeCompare(b[1], lang)
                return locale_sort
            } catch (error) {
                console.log('failed to sort', JSON.stringify({a, b}, null, 4));
                throw new Error(error)
            }
        });

        var objSorted = {}
        for (let index = 0; index < sortable.length; index++) {
            const item = sortable[index];
            objSorted[item[0]]=item[1]
        }
        return objSorted
    }

    function dateTimeSort(to_sort) {
        let sortable = []
        for (var item in to_sort) {
            sortable.push([item, to_sort[item]]);
        }

        sortable = sortable.sort(function(a, b) {
            try {
                const sort = (a[1] > b[1]) ? 1 : ((b[1] > a[1]) ? -1 : 0)
                return sort
            } catch (error) {
                console.log('failed to sort', JSON.stringify({a, b}, null, 4));
                throw new Error(error)
            }
        });

        var objSorted = {}
        for (let index = 0; index < sortable.length; index++) {
            const item = sortable[index];
            objSorted[item[0]]=item[1]
        }
        return objSorted
    }

    let sorted_filters = {
        programmes: mSort(filters.programmes),
        languages: mSort(filters.languages),
        countries: mSort(filters.countries),
        subtitles: mSort(filters.subtitles),
        premieretypes: mSort(filters.premieretypes),
        towns: mSort(filters.towns),
        cinemas: mSort(filters.cinemas),
        dates: dateTimeSort(filters.dates),
        times: dateTimeSort(filters.times)
    }

    let searchYAML = yaml.safeDump(screenings_search, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(path.join(fetchDir, `search_screenings.${lang}.yaml`), searchYAML, 'utf8')

    let filtersYAML = yaml.safeDump(sorted_filters, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(path.join(fetchDir, `filters_screenings.${lang}.yaml`), filtersYAML, 'utf8')



}
