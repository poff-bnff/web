const fs = require('fs');
const Fetcher = require('./fetch_spreadsheet_data');

// t88kataloogiks skripti kataloog
process.chdir(__dirname);

let spreadsheetId = '1J_cYJnZI41V8TGuOa8GVDjnHSD9qRmgKTJR3sd9Ff7Y'
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
            'synopsis': {'et': element['filmSynopsis_et'],
                         'en': element['filmSynopsis_en'],
                         'ru': '',
                        },
            'media': {'Stills': [],
                      'Posters': [],
                      'Trailer': {'Url': '',
                                  'Source': '',
                                },
                      'QaClip': {'Url': '',
                                 'Source': '',
                                },
                    },
            'tags': {'tag_premiere_types': '',
                     'tag_programmes': element[''],
                     'tag_genres': element[''],
                     'tag_keywords': element[''],
                    },
            'slug_et': element['path_et'],
            'slug_en': element['path_en'],
            'slug_ru': '',
            'countries': ,
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
    //         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwNDA2LCJleHAiOjE1OTk4MzI0MDZ9.ZddzcDSe7O130sr4dtxr2XOSP7j-BTmlOI8TGxWgKdM',
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
