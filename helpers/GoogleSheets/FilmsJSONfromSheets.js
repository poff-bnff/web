const fs = require('fs');
const request = require('request');
const Fetcher = require('./FromSheets');
const slugify = require('slugify');


// t88kataloogiks skripti kataloog
process.chdir(__dirname);

function splitMultibleNames(txt){
    let names = txt.split(',');
    let cast = [];
    names.forEach(name =>
        cast.push({'et':name, 'en':name, 'ru':name})
    )
    return cast;
}

function splitMultibleCompanies(txt){
    let names = txt.split('/');
    let cast = [];
    names.forEach(name =>
        cast.push({'et':name, 'en':name, 'ru':name})
    )
    return cast;
}

function ProcessCountries(txt){
    let countryNames = txt.split(', ');
    let countryCodes = [];
    let countryFromISOcountries = JSON.parse(fs.readFileSync('../data/ISOCountriesFromStrapi.json', 'utf-8'));
    countryNames.forEach(name => {
        let found = {'name': name};
        countryFromISOcountries.forEach(value => {
            // console.log(value);
            if (name == value['name_en']){
                found['id'] = value['id']
            }
        } )
        countryCodes.push(found);
    })
    console.log(countryCodes);
    return countryCodes;
}

function ProcessLanguages(txt){
    let languageNames = txt.split(', ');
    let languageCodes = [];
    let languageFromISOcountries = JSON.parse(fs.readFileSync('../data/ISOLanguagesFromStrapi.json', 'utf-8'));
    languageNames.forEach(name => {
        let found = {'name': name};
        languageFromISOcountries.forEach(value => {
            // console.log(value);
            if (name == value['name_en']){
                found['id'] = value['id']
            }
        } )
        languageCodes.push(found);
    })
    console.log(languageCodes);
    return languageCodes;
}

function ProcessDataCB(source){
    let headers = source.values[0];
    source.values.shift();
    // console.log(headers);

    let target = new Array()
    source.values.forEach(element => {
        // console.log(element);
        let languages_o = {}
        for (const [key, value] of Object.entries(headers)) {
            languages_o[value] = element[key]
        };
        target.push(languages_o);
    });
    // console.log(target);

    let filmList = new Array;
    let film_object = {};
    target.forEach(element => {
        film_object = {
            'filmId': element['filmEventivalId'],
            'title_et': element['filmTitle_et'],
            'title_en': element['filmTitle_en'],
            'title_ru': '',
            'titleOriginal': element['filmTitleOriginal'],
            'year': element['filmYear'],
            'runtime': element['filmDuration'],
            'credentials': {'director': splitMultibleNames(element['filmDirector']),
                            'screenwriter': splitMultibleNames(element['filmScreenwriter']),
                            'doP': splitMultibleNames(element['filmDop']),
                            'cast': splitMultibleNames(element['filmCast']),
                            'composer': splitMultibleNames(element['filmComposer']),
                            'editor': [],
                            'producer': [],
                            'coProducer': [],
                            'productionCompany':splitMultibleCompanies(element['filmProduction']),
                            },
            'synopsis': {'et': element['filmSynopsis_et'] || '',
                         'en': element['filmSynopsis_en'] || '',
                         'ru': '',
                        },
            'media': {'Stills': [],
                      'Posters': [],
                      'Trailer': [{'Url': '',
                                    'Source': '',
                                }],
                      'QaClip': [{'Url': '',
                                 'Source': '',
                                }],
                    },
            'tags': {'tag_premiere_types': [],
                     'tag_programmes': element['tagProgramme'] || [],
                     'tag_genres': element['tagGenre'] || [],
                     'tag_keywords': element['tagKeyword'] || [],
                    },
            'countriesAndLanguages': {'countries': ProcessCountries(element['filmCountries_en']),
                                      'languages': ProcessLanguages(element['filmLanguages_en']),
                                    },
            'screenings': '',
            'slug_et': slugify((element['filmTitle_et']), {lower:true}),
            'slug_en': slugify((element['filmTitle_en']), {lower:true}),
            'slug_ru': slugify('', {lower:true}),

        };
        // console.log(slugify(element['filmTitle_et']));

        filmList.push(film_object);


    });
    let filmsTarget = JSON.stringify(filmList, null, 4);
    fs.writeFileSync('../data/Films.json', filmsTarget);
}

    Fetcher.Fetch('1lFeU3M4tbm_2TvpPHReRVtUovmRKxQ2Xmv7ouQvwA3o', 'Filmid', ProcessDataCB);
