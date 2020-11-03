
const search_input = document.getElementById('search');
const programme_select = document.getElementById('programmesSelect');
const language_select = document.getElementById('languagesSelect');
const country_select = document.getElementById('countriesSelect');
const subtitle_select = document.getElementById('subtitlesSelect');
const premieretype_select = document.getElementById('premieretypesSelect');
const town_select = document.getElementById('townsSelect');
const cinema_select = document.getElementById('cinemasSelect');
const nonetoshow = document.getElementById('nonetoshow');

function toggleAll(ids) {


    if (ids.length) {
        nonetoshow.style.display = "none"
    } else {
        nonetoshow.style.display = "grid"
    }

    let cards = document.querySelectorAll('[class="card_film"]')
    cards.forEach(card => {
        // console.log(typeof ids[0], ' - ',typeof card.id);
        if (ids.includes(card.id)) {
            card.style.display = "grid"
        } else {
            card.style.display = "none"
        }
    })

    toggleFilters()
}

function toggleFilters() {
    for (const option of programme_select.options) {
        const value = option.value

        if (value !== '') {
            let count = searcharray
            .filter(cassette => cassette.programmes.includes(value))
            // .filter(cassette => cassette.languages.includes(language_select.value ? language_select.value : ''))
            // .filter(cassette => cassette.countries.includes(country_select.value))
            // .filter(cassette => cassette.subtitles.includes(subtitle_select.value))
            // .filter(cassette => cassette.towns.includes(parseInt(town_select.value)))
            // .filter(cassette => cassette.cinemas.includes(parseInt(cinema_select.value)))
            // .filter((cassette) => { return premieretype_select.value ? cassette.premieretypes.includes(premieretype_select.value : true }))
            // .filter((cassette) => { return search_input.value ? cassette.text.includes(search_input.value.toLowerCase()) : true }).length
            // option.innerHTML += `${count} ${value}`
            option.disabled = count ? false : true
        } else {
            option.disabled = false
        }
    }
    // console.log(programme_select.options.value);

}

search_input.addEventListener('keyup', e => {
    toggleAll(execute_filters());
});

programme_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

language_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

country_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

subtitle_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

premieretype_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

town_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

cinema_select.addEventListener('change', e => {
    toggleAll(execute_filters());
});

function unselect_all() {
    search_input.value = '';
    programme_select.selectedIndex = 0;
    language_select.selectedIndex = 0;
    country_select.selectedIndex = 0;
    subtitle_select.selectedIndex = 0;
    premieretype_select.selectedIndex = 0;
    town_select.selectedIndex = 0;
    cinema_select.selectedIndex = 0;
    nonetoshow.selectedIndex = 0;
    toggleAll(execute_filters());
}

function execute_filters() {
    let filtered = searcharray
        .filter(cassette => {
            if (programme_select.value) {
                return cassette.programmes.includes(programme_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (language_select.value) {
                return cassette.languages.includes(language_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (country_select.value) {
                return cassette.countries.includes(country_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (subtitle_select.value) {
                return cassette.subtitles.includes(subtitle_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (premieretype_select.value) {
                return cassette.premieretypes.includes(premieretype_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (town_select.value) {
                return cassette.towns.includes(parseInt(town_select.value))
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (cinema_select.value) {
                return cassette.cinemas.includes(parseInt(cinema_select.value))
            } else {
                return true
            }
        })
        .filter(cassette => cassette.text.includes(search_input.value.toLowerCase()))
        .map(element => element.id.toString());
    // console.log(filtered);
    // console.log(filtered.map(element => element.id));
    return filtered
}

console.log('foo'.includes(undefined));


