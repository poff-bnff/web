const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const { deleteFolderRecursive, JSONcopy } = require("./helpers.js")
const { timer } = require("./timer")
const moment = require('moment')
timer.start(__filename)

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
const STRAPIDATA_PROGRAMMES = STRAPIDATA['Programme']
const STRAPIDATA_FE = STRAPIDATA['FestivalEdition']
const STRAPIDATA_SCREENINGS = STRAPIDATA['Screening']
const STRAPIDATA_FESTIVAL = STRAPIDATA['Festival']
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

    const cassette_path = path.join(cassettes_path, s_cassette.slug_en)
    fs.mkdirSync(cassette_path, { recursive: true })

    const cassette_pug_path = path.join(cassette_path, 'index.pug')
    fs.writeFileSync(cassette_pug_path, `include /_templates/cassette_templates/cassette_poff_index_template.pug`)


    const s_films = STRAPIDATA_FILMS.filter(s_film => {
        s_cassette.orderedFilms.map(o_f => { return o_f.id }).includes(s_film.id)
    })
    const s_screenings = STRAPIDATA_SCREENINGS.filter(s_screening => {
        s_screening.cassette.id === s_cassette.id
    })
    for (const lang of allLanguages) {
        const cassette_data = distill_strapi_cassette(s_cassette, s_films, s_screenings, lang)
        const cassette_data_path = path.join(cassette_path, `data.${lang}.yaml`)
        try {
            const cassette_yaml = yaml.safeDump(cassette_data, { 'noRefs': true, 'indent': '4' })
            fs.writeFileSync(cassette_data_path, cassette_yaml, 'utf8')
        } catch (error) {
            timer.log(__filename, `ERROR with dumping cassette ${s_cassette.id} data to ${cassette_data_path}.`)
            throw error
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
            return {
                titleBox: {
                    title: s_film[`title_${lang}`] || null,
                    original: s_film['title_original'] || null,
                    en: s_film['title_en'] || null,
                    et: s_film['title_et'] || null,
                    ru: s_film['title_ru'] || null
                },
                year: s_film['year'] || null,
                premierTypes: distill_datapieces(s_film.tags.premiere_types, lang),
                cassetteCarouselPicsFilms: distill_film_stills(s_film),
                cassetteTrailers: distill_cassette_trailers(s_cassette),
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
                    programmeNames: distill_datapieces(s_film.tags.programmes, `slug_${lang}`),
                    genres: s_film.tags.genres.map(pt => pt[lang]),
                    keywords: s_film.tags.keywords.map(kw  => kw[lang]),
                    synopsis_md: s_film.synopsis[lang] || s_film.synopsis.en || null
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

        function distill_directors(s_film, lang) {
            return STRAPIDATA_PERSONS.filter(p => {
                return s_film.credentials.rolePerson.filter(rp => {
                    return rp.role_at_film.roleNamePrivate === 'Director'
                }).map(rp => {
                    return rp.person.id
                }).includes(p.id)
                .map(p => {
                    return {
                        portrait: `https://assets.poff.ee/img/${p.picture.hash}${p.picture.ext}`,
                        name: p.firstNameLastName,
                        biography: distill_datapiece(p.biography, lang),
                        filmography: distill_datapiece(p.filmography, lang)
                    }
                })
            })
        }

        function distill_festival_editions(s_cassette, lang) {
            try {
                return s_cassette.festival_editions.map(fe => {
                    return fe[`name_${lang}`]
                })
            } catch (error) {
                return []
            }
        }

        function distill_credentials(s_film, role_name) {
            return s_film.credentials.rolePerson.filter(rp => {
                return rp.role_at_film.roleNamePrivate === role_name
            }).map(rp => {
                return rp.person.firstNameLastName
            })
        }

        function distill_ordered_countries(s_film, lang) {
            try {
                return s_film.orderedCountries.sort((a, b) => {
                    return a.order > b.order
                }).map(oc => {
                    return oc[`name_${lang}`]
                })
            } catch (error) {
                return []
            }
        }

        function distill_film_stills(s_film) {
            try {
                return s_film.media.stills.map(still => {
                    return `https://assets.poff.ee/img/${still.hash}${still.ext}`
                })
            } catch (error) {
                return []
            }
        }
    }

    function distill_cassette_screenings(s_cassette, s_screenings, lang) {
        moment.locale(lang)
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
                    hall_name: distill_datapiece(s_screening.location.hall, `name_${lang}`),
                    cinema_name: distill_datapiece(s_screening.location.cinema, `name_${lang}`),
                    town_name: distill_datapiece(s_screening.location.town, `name_${lang}`)
                },
                qna: distill_intro_qanda_conversation(s_screening, 'QandA'),
                intro: distill_intro_qanda_conversation(s_screening, 'Intro'),
                conversation: distill_intro_qanda_conversation(s_screening, 'Conversation')
            }
        }).sort((a, b) => { return new Date(a.dateTime) - new Date(b.dateTime) })

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
            return data.piece
        } catch (error) {
            return null
        }
    }

    function distill_datapieces(data, piece) {
        try {
            return data.map(d => d[piece])
        } catch (error) {
            return []
        }
    }
}

return


if (s_cassette_copy.festival_editions && s_cassette_copy.festival_editions.length) {
    for (const festEdIx in s_cassette_copy.festival_editions) {
        var festEd = s_cassette_copy.festival_editions[festEdIx]
        var festival = JSONcopy(STRAPIDATA_FESTIVAL.filter((a) => { return festEd.festival === a.id })[0])
        if (festival) {
            s_cassette_copy.festivals = []
            s_cassette_copy.festivals.push(festival)
        }
    }
}

let slugEn = undefined
if (s_cassette_copy.films && s_cassette_copy.films.length === 1) {
    slugEn = s_cassette_copy.films[0].slug_en
    if (!slugEn) {
        slugEn = s_cassette_copy.films[0].slug_et
    }
}
if (!slugEn) {
    slugEn = s_cassette_copy.slug_en
    if (!slugEn) {
        slugEn = s_cassette_copy.slug_et
    }
}

if (typeof slugEn !== 'undefined') {
    s_cassette_copy.dirSlug = slugEn

    let cassetteCarouselPicsCassette = []
    let cassetteCarouselPicsFilms = []
    let cassettePostersCassette = []
    let cassettePostersFilms = []

    // Kasseti programmid
    if (s_cassette_copy.tags && s_cassette_copy.tags.programmes && s_cassette_copy.tags.programmes[0]) {
        for (const programmeIx in s_cassette_copy.tags.programmes) {
            let programme = s_cassette_copy.tags.programmes[programmeIx]
            let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter((a) => { return programme.id === a.id })
            if (typeof programmeFromYAML !== 'undefined' && programmeFromYAML[0]) {
                s_cassette_copy.tags.programmes[programmeIx] = JSONcopy(programmeFromYAML[0])
            }
        }
    }

    // Kasseti treiler
    if (s_cassette_copy.media && s_cassette_copy.media.trailer && s_cassette_copy.media.trailer[0]) {
        for (trailer of s_cassette_copy.media.trailer) {
            if (trailer.url && trailer.url.length > 10) {
                if (trailer.url.includes('vimeo')) {
                    let splitVimeoLink = trailer.url.split('/')
                    let videoCode = splitVimeoLink !== undefined ? splitVimeoLink[splitVimeoLink.length - 1] : ''
                    if (videoCode.length === 9) {
                        trailer.videoCode = videoCode
                    }
                } else {
                    let splitYouTubeLink = trailer.url.split('=')[1]
                    let splitForVideoCode = splitYouTubeLink !== undefined ? splitYouTubeLink.split('&')[0] : ''
                    if (splitForVideoCode.length === 11) {
                        trailer.videoCode = splitForVideoCode
                    }
                }
            }
        }
    }

    // rueten func. is run for each s_cassette_copy separately instead of whole data, that is
    // for the purpose of saving slug_en before it will be removed by rueten func.
    rueten(s_cassette_copy, lang)

    if (s_cassette_copy.films && s_cassette_copy.films.length) {
        for (const filmIx in s_cassette_copy.films) {
            let oneFilm = s_cassette_copy.films[filmIx]
            let s_film = STRAPIDATA_FILMS.filter((a) => { return oneFilm.id === a.id })
            if (s_film !== undefined && s_film[0]) {
                s_cassette_copy.films[filmIx] = JSONcopy(s_film[0])
            }
        }
    }

    // #379 put ordered films to cassette.film
    let ordered_films = s_cassette_copy.orderedFilms
        .filter((isFilm) => { if (isFilm.film) { return 1 } else { console.log(`ERROR! Empty film under cassette with ID ${s_cassette_copy.id}`) } })
        .map(s_c_film => {

            if (!s_c_film.film) {
                // console.log('ERROR: Cassette with no ordered film', s_cassette_copy.id);
                cassettesWithOutFilms.push(s_cassette_copy.id)
                // throw new Error('Cassette with no ordered film')
            } else {
                let s_films = STRAPIDATA_FILMS.filter((s_film) => { return s_c_film.film.id === s_film.id })

                if (s_films && s_films[0]) {
                    s_films[0].ordinal = s_c_film.order
                    return s_films[0]
                } else {
                    return null
                }
            }
        })
    if (ordered_films !== undefined && ordered_films[0]) {
        s_cassette_copy.films = JSON.parse(JSON.stringify(ordered_films))
    }

    // Screenings
    let screenings = []
    for (screeningIx in STRAPIDATA_SCREENINGS) {
        let screening = JSONcopy(STRAPIDATA_SCREENINGS[screeningIx])
        if (screening.cassette && screening.cassette.id === s_cassette_copy.id
            && screening.screening_types && screening.screening_types[0]) {

            let screeningNames = function (item) {
                let itemNames = item.name
                return itemNames
            }
            // Kontroll kas screeningtype kassetile lisada, st kas vähemalt üks screening type on whichScreeningTypesToFetch arrays olemas
            if (!screening.screening_types.map(screeningNames).some(ai => whichScreeningTypesToFetch.includes(ai.toLowerCase()))) {
                continue
            }
            // Kui vähemalt üks screeningtype õige, siis hasOneCorrectScreening = true
            // - st ehitatakse
            hasOneCorrectScreening = true

            delete screening.cassette
            screenings.push(rueten(screening, lang))
        }
    }

    if (screenings.length > 0) {
        s_cassette_copy.screenings = screenings
    }

    // let s_cassette_copy = JSONcopy(s_cassette_copy))
    // let aliases = []
    let languageKeys = ['en', 'et', 'ru']
    for (key in s_cassette_copy) {
        if (key == 'slug') {
            s_cassette_copy.path = `film/${s_cassette_copy[key]}`
            s_cassette_copy.slug = `${s_cassette_copy[key]}`
        }

        if (typeof (s_cassette_copy[key]) === 'object' && s_cassette_copy[key] != null) {
            // makeCSV(s_cassette_copy[key], s_cassette_copy, lang)
        }
    }

    if (s_cassette_copy.path === undefined) {
        s_cassette_copy.path = `film/${slugEn}`
        s_cassette_copy.slug = slugEn
    }

    // Cassette carousel pics
    if (s_cassette_copy.media && s_cassette_copy.media.stills && s_cassette_copy.media.stills[0]) {
        for (const stillIx in s_cassette_copy.media.stills) {
            let still = s_cassette_copy.media.stills[stillIx]
            if (still.hash && still.ext) {
                if (still.hash.substring(0, 4) === 'F_1_') {
                    cassetteCarouselPicsCassette.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                }
                cassetteCarouselPicsCassette.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
            }
        }
    }

    if (cassetteCarouselPicsCassette.length > 0) {
        s_cassette_copy.cassetteCarouselPicsCassette = cassetteCarouselPicsCassette
    }

    // Cassette poster pics
    if (s_cassette_copy.media && s_cassette_copy.media.posters && s_cassette_copy.media.posters[0]) {
        for (const posterIx in s_cassette_copy.media.posters) {
            let poster = s_cassette_copy.media.posters[posterIx]
            if (poster.hash && poster.ext) {
                if (poster.hash.substring(0, 2) === 'P_') {
                    cassettePostersCassette.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                }
                cassettePostersCassette.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
            }
        }
    }

    if (cassettePostersCassette.length > 0) {
        s_cassette_copy.cassettePostersCassette = cassettePostersCassette
    }

    if (s_cassette_copy.films && s_cassette_copy.films[0]) {
        for (scc_film of s_cassette_copy.films) {
            // console.log(scc_film);
            let filmSlugEn = scc_film.slug_en

            if (!filmSlugEn) {
                filmSlugEn = scc_film.slug
            }
            if (typeof filmSlugEn !== 'undefined') {
                scc_film.dirSlug = filmSlugEn
            }

            // Film carousel pics
            if (scc_film.media && scc_film.media.stills && scc_film.media.stills[0]) {
                for (still of scc_film.media.stills) {
                    if (still.hash && still.ext) {
                        if (still.hash.substring(0, 4) === 'F_1_') {
                            cassetteCarouselPicsFilms.unshift(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                        }
                        cassetteCarouselPicsFilms.push(`https://assets.poff.ee/img/${still.hash}${still.ext}`)
                    }
                }
            }

            if (cassetteCarouselPicsFilms.length > 0) {
                s_cassette_copy.cassetteCarouselPicsFilms = cassetteCarouselPicsFilms
            }

            // Film posters pics
            if (scc_film.media && scc_film.media.posters && scc_film.media.posters[0]) {
                for (poster of scc_film.media.posters) {
                    if (poster.hash && poster.ext) {
                        if (poster.hash.substring(0, 2) === 'P_') {
                            cassettePostersFilms.unshift(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                        }
                        cassettePostersFilms.push(`https://assets.poff.ee/img/${poster.hash}${poster.ext}`)
                    }
                }
            }

            if (cassettePostersFilms.length > 0) {
                s_cassette_copy.cassettePostersFilms = cassettePostersFilms
            }

            // Filmi treiler
            if (scc_film.media && scc_film.media.trailer && scc_film.media.trailer[0]) {
                for (trailer of scc_film.media.trailer) {
                    if (trailer.url && trailer.url.length > 10) {
                        if (trailer.url.includes('vimeo')) {
                            let splitVimeoLink = trailer.url.split('/')
                            let videoCode = splitVimeoLink !== undefined ? splitVimeoLink[splitVimeoLink.length - 1] : ''
                            if (videoCode.length === 9) {
                                trailer.videoCode = videoCode
                            }
                        } else {
                            let splitYouTubeLink = trailer.url.split('=')[1]
                            let splitForVideoCode = splitYouTubeLink !== undefined ? splitYouTubeLink.split('&')[0] : ''
                            if (splitForVideoCode.length === 11) {
                                trailer.videoCode = splitForVideoCode
                            }
                        }
                    }
                }
            }

            // Filmi programmid
            if (scc_film.tags && scc_film.tags.programmes && scc_film.tags.programmes[0]) {
                for (const programmeIx in scc_film.tags.programmes) {
                    let programme = scc_film.tags.programmes[programmeIx]
                    let programmeFromYAML = STRAPIDATA_PROGRAMMES.filter((a) => { return programme.id === a.id })
                    if (typeof programmeFromYAML[0] !== 'undefined') {
                        scc_film.tags.programmes[programmeIx] = JSONcopy(programmeFromYAML[0])
                    } else {
                        timer.log(__filename, `Error! Programme with ID ${programme.id}, under film with ID ${scc_film.id} - domain ${DOMAIN} probably not assigned to this programme!`)
                    }
                }
            }

            if (scc_film.credentials && scc_film.credentials.rolePerson && scc_film.credentials.rolePerson[0]) {
                let rolePersonTypes = {}
                scc_film.credentials.rolePerson.sort(function (a, b) { return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0) })
                for (roleIx in scc_film.credentials.rolePerson) {
                    let rolePerson = scc_film.credentials.rolePerson[roleIx]
                    if (rolePerson === undefined) { continue }
                    if (rolePerson.person) {
                        let searchRegExp = new RegExp(' ', 'g')
                        const role_name_lc = rolePerson.role_at_film.roleNamePrivate.toLowerCase().replace(searchRegExp, '')
                        rolePersonTypes[role_name_lc] = rolePersonTypes[role_name_lc] || []

                        if (rolePerson.person.firstNameLastName) {
                            rolePersonTypes[role_name_lc].push(rolePerson.person.firstNameLastName)
                        } else if (rolePerson.person.id) {
                            let personFromYAML = STRAPIDATA_PERSONS.filter((a) => { return rolePerson.person.id === a.id })[0]
                            if (personFromYAML.fullName) {
                                rolePersonTypes[role_name_lc].push(personFromYAML.fullName)
                            }
                        }
                    } else {
                        // timer.log(__filename, film.id, ' - ', rolePerson.role_at_film.roleNamePrivate)
                    }
                    //- - timer.log(__filename, 'SEEEE ', rolePersonTypes[`${rolePerson.role_at_film.roleNamePrivate.toLowerCase()}`], ' - ', rolePerson.role_at_film.roleNamePrivate.toLowerCase(), ' - ', rolePersonTypes)
                }
                // console.log('foo2', scc_film.id, rolePersonTypes);
                scc_film.credentials.rolePersonsByRole = rolePersonTypes
            }
        }
        rueten(s_cassette_copy.films, lang)
    }

    if (hasOneCorrectScreening === true) {
        allData.push(s_cassette_copy)
        s_cassette_copy.data = dataFrom
        // timer.log(__filename, util.inspect(s_cassette_copy, {showHidden: false, depth: null}))
        generateYaml(s_cassette_copy, lang)
    } else {
        cassettesWithOutSpecifiedScreeningType.push(s_cassette_copy.id)
    }

} else {
    slugMissingErrorNumber++
    slugMissingErrorIDs.push(s_cassette_copy.id)
}
    }
if (slugMissingErrorNumber > 0) {
    timer.log(__filename, `Notification! Value of slug_en or slug_et missing for total of ${slugMissingErrorNumber} cassettes with ID's ${slugMissingErrorIDs.join(', ')}`)
}
if (cassettesWithOutFilms.length) {
    uniqueIDs = [...new Set(cassettesWithOutFilms)]
    timer.log(__filename, `ERROR! No films under cassettes with ID's ${uniqueIDs.join(', ')}`)
}
if (cassettesWithOutSpecifiedScreeningType.length) {
    uniqueIDs2 = [...new Set(cassettesWithOutSpecifiedScreeningType)]
    timer.log(__filename, `Skipped cassettes with IDs ${uniqueIDs2.join(', ')}, as none of screening types are ${whichScreeningTypesToFetch.join(', ')}`)
}
generateAllDataYAML(allData, lang)
}

function generateYaml(element, lang) {
    let yamlStr = yaml.safeDump(element, { 'noRefs': true, 'indent': '4' })

}

function generateAllDataYAML(allData, lang) {


    for (cassette of allData) {

        function picSplit(txt) {
            return txt.replace('assets.poff.ee/img/', 'assets.poff.ee/img/thumbnail_')
        }

        cassette.cassetteCarouselPicsCassetteThumbs = (cassette.cassetteCarouselPicsCassette || []).map(txt => picSplit(txt))
        cassette.cassetteCarouselPicsFilmsThumbs = (cassette.cassetteCarouselPicsFilms || []).map(txt => picSplit(txt))
        cassette.cassettePostersCassetteThumbs = (cassette.cassettePostersCassette || []).map(txt => picSplit(txt))
        cassette.cassettePostersFilmsThumbs = (cassette.cassettePostersFilms || []).map(txt => picSplit(txt))

    }


    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
    fs.writeFileSync(path.join(fetchDir, `cassettes.${lang}.yaml`), allDataYAML, 'utf8')
    timer.log(__filename, `Ready for building are ${allData.length} cassettes`)

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
}
