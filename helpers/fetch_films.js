const fs = require('fs');
const Fetcher = require('./fetch_spreadsheet_data');

// t88kataloogiks skripti kataloog
process.chdir(__dirname);

let spreadsheetId = '1lFeU3M4tbm_2TvpPHReRVtUovmRKxQ2Xmv7ouQvwA3o'
let range = 'Filmid'
Fetcher.Fetch(spreadsheetId, range, ProcessDataCB)


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
    let countryFromISOcountries = JSON.parse(fs.readFileSync('ISOCountriesFromStrapi.json', 'utf-8'));
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
    let languageFromISOcountries = JSON.parse(fs.readFileSync('ISOLanguagesFromStrapi.json', 'utf-8'));
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

        };
        // console.log(splitMultibleNames(element['filmDirector']));

        filmList.push(film_object);
    });


    console.log(filmList[0]);

    let filmsTarget = JSON.stringify(filmList, null, 4);
    fs.writeFileSync('Films.json', filmsTarget);

    // target.forEach (film => {
    //     let request = require('request');
    //     options = {
    //     'method': 'POST',
    //     'url': 'http://139.59.130.149/films',
    //     'headers': {
    //         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwODk2LCJleHAiOjE1OTk4MzI4OTZ9.KKt5IQQTx1KyHwQ_h3yCbcE9S_zi5x8ZvDqzcP87tN0',
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(film)

    //     };
    //     request(options, function (error, response) {
    //     if (error) throw new Error(error);
    //     console.log(response.body);
    // });
    // })
    // console.log(film)
}
