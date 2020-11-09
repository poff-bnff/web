const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const { deleteFolderRecursive, JSONcopy } = require("./helpers.js")
const { timer } = require("./timer")
const moment = require('moment')
timer.start(__filename)
const util = require('util')

const rootDir = path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const sourceDir = path.join(rootDir, 'source')
const cassetteTemplatesDir = path.join(sourceDir, '_templates', 'cassette_templates')
const fetchDir = path.join(sourceDir, '_fetchdir')
const cassettes_path = path.join(fetchDir, 'cassettes')

const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))

const STRAPIDATA_PERSONS = STRAPIDATA['Person']
const STRAPIDATA_CASSETTE = STRAPIDATA['Cassette']
const STRAPIDATA_SCREENINGS = STRAPIDATA['Screening']
const STRAPIDATA_FILMS = STRAPIDATA['Film']

const CASSETTELIMIT = parseInt(process.env['CASSETTELIMIT']) || 0

// Kõik Screening_types name mida soovitakse kasseti juurde lisada, VÄIKETÄHTEDES
const whichScreeningTypesToFetch = ['first screening', 'regular', 'online kino']

const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const MAPPED_DOMAIN = DOMAIN_SPECIFICS.domain[DOMAIN]
const allLanguages = DOMAIN_SPECIFICS.locales[DOMAIN]

deleteFolderRecursive(cassettes_path)

timer.log(__filename, `Distilling ${DOMAIN} cassettes.`)

let cassette_counter = 0
for (const s_cassette of STRAPIDATA_CASSETTE) {
    if (!s_cassette.slug_en) {
        timer.log(__filename, 'MISSING: no slug_en for cassette ' + s_cassette.id)
        continue
    }
    if (CASSETTELIMIT && cassette_counter++ > CASSETTELIMIT) {
        break
    }
    timer.log(__filename, `CASSETTE ${s_cassette.id}`)

    const cassette_path = path.join(cassettes_path, s_cassette.slug_en)
    fs.mkdirSync(cassette_path, { recursive: true })

    const cassette_pug_path = path.join(cassette_path, 'index.pug')
    fs.writeFileSync(cassette_pug_path, `include /_templates/cassette_templates/cassette_poff_index_template.pug`)

    const s_films = s_cassette.orderedFilms
    .sort((a, b) => a.order < b.order)
    .map(o_f => {
        return STRAPIDATA_FILMS.filter(s_film => { return s_film.id === o_f.film.id })[0]
    })

    // console.log(util.inspect(s_films));
    const s_screenings = STRAPIDATA_SCREENINGS.filter(s_screening => {
        try {
            return s_screening.cassette.id === s_cassette.id
        } catch (error) {
            return false
        }
    })
    for (const lang of allLanguages) {
        const cassette_data = distill_strapi_cassette(s_cassette, s_films, s_screenings, lang)
        const cassette_data_path = path.join(cassette_path, `data.${lang}.yaml`)
        const data_to_dump = cassette_data
        try {
            const cassette_yaml = yaml.safeDump(data_to_dump, { 'noRefs': true, 'indent': '4' })
            fs.writeFileSync(cassette_data_path, cassette_yaml, 'utf8')
        } catch (error) {
            console.log(error)
            throw new Error(util.inspect(data_to_dump, false, 8))
        }
    }
}


function distill_strapi_cassette(s_cassette, s_films, s_screenings, lang) {
    return {
        films: distill_cassette_films(s_cassette, s_films, lang),
        screenings: distill_cassette_screenings(s_cassette, s_screenings, lang)
    }

    function distill_cassette_films(s_cassette, s_films, lang) {
        return s_films.map(s_film => {
            timer.log(__filename, `${lang}, CASSETTE ${s_cassette.id}, FILM ${s_film.id}`)
            return {
                titleBox: {
                    title: s_film[`title_${lang}`] || null,
                    original: s_film['title_original'] || null,
                    en: s_film['title_en'] || null,
                    et: s_film['title_et'] || null,
                    ru: s_film['title_ru'] || null
                },
                year: s_film['year'] || null,
                premierTypes: distill_premiere_types(s_film, lang),
                cassetteCarouselPicsFilms: distill_film_stills(s_film),
                cassetteTrailers: distill_film_trailers(s_film),
                countryNames: distill_ordered_countries(s_film, lang),
                credentials: {
                    directorofphotography: distill_credentials(s_film, 'Director of Photography'),
                    editor: distill_credentials(s_film, 'Editor'),
                    productioncompany: distill_credentials(s_film, 'Production Company'),
                    director: distill_credentials(s_film, 'Director'),
                    producer: distill_credentials(s_film, 'Producer'),
                    screenwriter: distill_credentials(s_film, 'Screenwriter'),
                    music: distill_credentials(s_film, 'Music'),
                    cast: distill_credentials(s_film, 'Cast')
                },
                synopsisBox: {
                    festivalEditionNames: distill_festival_editions(s_cassette, lang),
                    programmeNames: distill_programme_names(s_film, lang),
                    genres: distill_film_genres(s_film, lang),
                    keywords: distill_film_keywords(s_film, lang),
                    synopsis_md: distill_film_synopsis(s_film, lang)
                },
                runtime: s_film.runtime || null,
                languages: distill_datapieces(s_film.languages, `name_${lang}`),
                directors: distill_directors(s_film, lang),
                presenters: [
                    {
                        text: "",
                        logos: [
                            {
                                logo: "",
                                url: ""
                            }
                        ]
                    }
                ]
            }
        })

        function distill_film_synopsis(s_film, lang) {
            try {
                return s_film.synopsis[lang] || s_film.synopsis.en || null
            } catch (error) {
                timer.log(__filename, `INFO: no synopsis for film ${s_film.id}, in ${lang}`)
                return null
            }
        }

        function distill_film_keywords(s_film, lang) {
            try {
                return s_film.tags.keywords.map(kw => kw[lang])
            } catch (error) {
                timer.log(__filename, `INFO: no keywords for film ${s_film.id}, in ${lang}`)
                return null
            }
        }

        function distill_film_genres(s_film, lang) {
            try {
                return s_film.tags.genres.map(pt => pt[lang])
            } catch (error) {
                timer.log(__filename, `INFO: no genres for film ${s_film.id}, in ${lang}`)
                return null
            }
        }

        function distill_premiere_types(s_film, lang) {
            try {
                return distill_datapieces(s_film.tags.premiere_types, lang)
            } catch (error) {
                timer.log(__filename, `INFO: no premiere types for film ${s_film.id}, in ${lang}`)
                return []
            }
        }

        function distill_directors(s_film, lang) {
            try {
                return STRAPIDATA_PERSONS.filter(p => {
                    return s_film.credentials.rolePerson.filter(rp => {
                        return rp.role_at_film.roleNamePrivate === 'Director'
                    }).map(rp => {
                        return rp.person.id
                    }).includes(p.id)
                    .map(p => {
                        return {
                            portrait: `https://assets.poff.ee/img/${p.picture.hash}${p.picture.ext}`,
                            name: p.firstNameLastName || null,
                            biography: distill_datapiece(p.biography, lang),
                            filmography: distill_datapiece(p.filmography, lang)
                        }
                    })
                })
            } catch (error) {
                timer.log(__filename, `INFO: no directors for film ${s_film.id}, in ${lang}`)
                return []
            }
        }

        function distill_festival_editions(s_cassette, lang) {
            try {
                return s_cassette.festival_editions.map(fe => {
                    return fe[`name_${lang}`]
                })
            } catch (error) {
                timer.log(__filename, `INFO: no festival editions for cassette ${s_cassette.id}, in ${lang}`)
                return []
            }
        }

        function distill_credentials(s_film, role_name) {
            try {
                return s_film.credentials.rolePerson.filter(rp => {
                    return rp.role_at_film.roleNamePrivate === role_name && rp.person.firstNameLastName
                }).map(rp => {
                    return rp.person.firstNameLastName
                })
            } catch (error) {
                timer.log(__filename, `INFO: no credentials for film ${s_film.id}, in ${lang}`)
                return []
            }
        }

        function distill_ordered_countries(s_film, lang) {
            try {
                return s_film.orderedCountries.sort((a, b) => {
                    return a.order < b.order
                }).map(oc => {
                    return oc.country[`name_${lang}`]
                })
            } catch (error) {
                timer.log(__filename, `INFO: no countries for film ${s_film.id}, in ${lang}`)
                return []
            }
        }

        function distill_film_trailers(s_film) {
            try {
                return s_film.media.trailer.map(trailer => {
                    return split('=', trailer.url)[1]
                })
            } catch (error) {
                timer.log(__filename, `INFO: no trailers for film ${s_film.id}`)
                return []
            }
        }

        function distill_film_stills(s_film) {
            try {
                return s_film.media.stills.map(still => {
                    return `https://assets.poff.ee/img/${still.hash}${still.ext}`
                })
            } catch (error) {
                timer.log(__filename, `INFO: no stills for film ${s_film.id}`)
                return []
            }
        }

        function distill_programme_names(s_film, lang) {
            try {
                return distill_datapieces(s_film.tags.programmes, `slug_${lang}`)
            } catch (error) {
                timer.log(__filename, `INFO: no programme names for film ${s_film.id}, in ${lang}`)
                return []
            }
        }
    }

    function distill_cassette_screenings(s_cassette, s_screenings, lang) {
        moment.locale(lang)
        try {
            return s_screenings.map(s_screening => {
                const screening_moment = moment(s_screening.dateTime)
                return {
                    date: screening_moment.format('Do MMM') + ', ' + screening_moment.format('dddd'),
                    time: screening_moment.format('HH:mm'),
                    datetime: s_screening.dateTime,
                    name: s_cassette[`title_${lang}`] || s_cassette[`title_en`] || null,
                    duration: s_screening.durationTotal || null,
                    subtitle_languages: distill_datapieces(s_screening.subtitles, `name_${lang}`),
                    booking_url: s_screening.booking_url || null,
                    ticketing_url: s_screening.ticketing_url || null,
                    location: {
                        hall_name: distill_hall_name(s_screening, lang),
                        cinema_name: distill_cinema_name(s_screening, lang),
                        town_name: distill_town_name(s_screening, lang)
                    },
                    qna: distill_intro_qanda_conversation(s_screening, 'QandA'),
                    intro: distill_intro_qanda_conversation(s_screening, 'Intro'),
                    conversation: distill_intro_qanda_conversation(s_screening, 'Conversation')
                }
            }).sort((a, b) => { return new Date(a.dateTime) - new Date(b.dateTime) })
        } catch (error) {
            timer.log(__filename, `INFO: no screenings for cassette ${s_cassette.id}, in ${lang}`)
            return []
        }

        function distill_town_name(s_screening, lang) {
            try {
                return distill_datapiece(s_screening.location.town, `name_${lang}`)
            } catch (error) {
                timer.log(__filename, `INFO: no town name for screening ${s_screening.id}, in ${lang}`)
                return null
            }
        }

        function distill_cinema_name(s_screening, lang) {
            try {
                return distill_datapiece(s_screening.location.cinema, `name_${lang}`)
            } catch (error) {
                timer.log(__filename, `INFO: no cinema name for screening ${s_screening.id}, in ${lang}`)
                return null
            }
        }

        function distill_hall_name(s_screening, lang) {
            try {
                return distill_datapiece(s_screening.location.hall, `name_${lang}`)
            } catch (error) {
                timer.log(__filename, `INFO: no hall name for screening ${s_screening.id}, in ${lang}`)
                return null
            }
        }

        function distill_intro_qanda_conversation(s_screening, type) {
            try {
                const filtered_iqac = s_screening.introQaConversation.filter(iqc => {
                    return iqc.type === type && iqc.yesNo === true
                })
                if (filtered_iqac.length === 0) {
                    return []
                }
                return {
                    presenters: distill_participants(filtered_iqac, 'presenter'),
                    guests: distill_participants(filtered_iqac, 'guest'),
                    duration: filtered_iqac.duration || null
                }
            } catch {
                return []
            }

            function distill_participants(filtered_iqac, role) {
                try {
                    return filtered_iqac.map(iqc => {
                        return iqc[role].map(iqc_p => {
                            return iqc_p.et
                        })
                    })
                } catch (error) {
                    return []
                }
            }
        }
    }

    function distill_datapiece(data, piece) {
        try {
            return data[piece]
        } catch (error) {
            // timer.log(__filename, `INFO: no ${piece} in datapiece`)
            return null
        }
    }

    function distill_datapieces(data, piece) {
        try {
            return data.map(d => d[piece].toString()) // toString makes sure to error on undefined
        } catch (error) {
            // timer.log(__filename, `INFO: no ${piece} in datapieces`)
            return []
        }
    }
}

return



// todo: #478 filtrid tuleb compareLocale sortida juba koostamisel.
let filters = {
    programmes: {},
    languages: {},
    countries: {},
    subtitles: {},
    premieretypes: {},
    towns: {},
    cinemas: {}
}
const cassette_search = allData.map(cassette => {
    let programmes = []
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
            console.log('bad creds on film', JSON.stringify({ film: film, creds: film.credentials }, null, 4));
            throw new Error(error)
        }
    }
    let subtitles = []
    let towns = []
    let cinemas = []
    for (const screenings of cassette.screenings) {
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
    }
    let premieretypes = []
    for (const types of cassette.tags.premiere_types || []) {
        const type_name = types
        premieretypes.push(type_name)
        filters.premieretypes[type_name] = type_name
    }
    return {
        id: cassette.id,
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
        cinemas: cinemas
    }
})

// sorted1 = [].slice.call(filters.programmes).sort((a, b) => a.localeCompare(b, lang))
// [].slice.call(filters.languages).sort((a, b) => a.localeCompare(b, lang))
// [].slice.call(filters.countries).sort((a, b) => a.localeCompare(b, lang))
// [].slice.call(filters.subtitles).sort((a, b) => a.localeCompare(b, lang))
// [].slice.call(filters.premieretypes).sort((a, b) => a.localeCompare(b, lang))
// [].slice.call(filters.towns).sort((a, b) => a.localeCompare(b, lang))
// [].slice.call(filters.cinemas).sort((a, b) => a.localeCompare(b, lang))
function mSort(to_sort) {
    let sortable = []
    for (var item in to_sort) {
        sortable.push([item, to_sort[item]]);
    }

    sortable = sortable.sort(function (a, b) {
        try {
            const locale_sort = a[1].localeCompare(b[1], lang)
            return locale_sort
        } catch (error) {
            console.log('failed to sort', JSON.stringify({ a, b }, null, 4));
            throw new Error(error)
        }
    });

    var objSorted = {}
    for (let index = 0; index < sortable.length; index++) {
        const item = sortable[index];
        objSorted[item[0]] = item[1]
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
}

let searchYAML = yaml.safeDump(cassette_search, { 'noRefs': true, 'indent': '4' })
fs.writeFileSync(path.join(fetchDir, `search_films.${lang}.yaml`), searchYAML, 'utf8')

let filtersYAML = yaml.safeDump(sorted_filters, { 'noRefs': true, 'indent': '4' })
fs.writeFileSync(path.join(fetchDir, `filters_films.${lang}.yaml`), filtersYAML, 'utf8')
