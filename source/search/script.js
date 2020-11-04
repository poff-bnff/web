
const search_input = document.getElementById('search');
const selectors = {
    programmes_select: document.getElementById('programmes_select'),
    languages_select: document.getElementById('languages_select'),
    countries_select: document.getElementById('countries_select'),
    subtitles_select: document.getElementById('subtitles_select'),
    premieretypes_select: document.getElementById('premieretypes_select'),
    towns_select: document.getElementById('towns_select'),
    cinemas_select: document.getElementById('cinemas_select')
}

const nonetoshow = document.getElementById('nonetoshow');



function toggleAll(exclude_selector_name) {

    ids = execute_filters()

    // kuva/peida 'pole vasteid'
    if (ids.length) {
        nonetoshow.style.display = "none"
    } else {
        nonetoshow.style.display = "grid"
    }

    // kuva/peida kassette
    let cards = document.querySelectorAll('[class="card_film"]')
    cards.forEach(card => {
        // console.log(typeof ids[0], ' - ',typeof card.id);
        if (ids.includes(card.id)) {
            card.style.display = "grid"
        } else {
            card.style.display = "none"
        }
    })

    // filtreeri filtreid
    toggleFilters(exclude_selector_name)
}

function toggleFilters(exclude_selector_name) {

    for (selector_name in selectors) {
        // console.log(exclude_selector_name, ' - ', selector_name);

        if (exclude_selector_name === selector_name) {
            continue
        }

        for (const option of selectors[selector_name].options) {
            const value = option.value
            if (value === '') {
                option.disabled = false // garanteerib tyhivaliku olemasolu
                continue
            }

            // console.log(`value is this '${value}' - ${typeof value}`);
            let count = searcharray
            .filter(cassette => {
                return (selector_name === 'programmes_select' ? value : selectors.programmes_select.value) === '' ? true : (
                    cassette.programmes.includes(
                        selector_name === 'programmes_select' ? value : selectors.programmes_select.value
                    )
                )
            })
            .filter(cassette => {
                return (selector_name === 'languages_select' ? value : selectors.languages_select.value) === '' ? true : (
                    cassette.languages.includes(
                        selector_name === 'languages_select' ? value : selectors.languages_select.value
                    )
                )
            })
            .filter((cassette) => { return search_input.value ? cassette.text.includes(search_input.value.toLowerCase()) : true })
            .length
            // .filter((cassette) => { return selectors.countries_select.value ? cassette.countries.includes(selectors.countries_select.value) : true })
            // .filter((cassette) => { return selectors.subtitles_select.value ? cassette.subtitles.includes(selectors.subtitles_select.value) : true })
            // .filter((cassette) => { return selectors.towns_select.value ? cassette.towns.includes(selectors.towns_select.value) : true })
            // .filter((cassette) => { return selectors.cinemas_select.value ? cassette.cinemas.includes(selectors.cinemas_select.value) : true })
            // .filter((cassette) => { return selectors.premieretypes_select.value ? cassette.premieretypes.includes(selectors.premieretypes_select.value) : true })
            // .filter((cassette) => { return search_input.value ? cassette.text.includes(search_input.value.toLowerCase()) : true })
            // option.innerHTML += `${count} ${value}`
            option.disabled = count ? false : true

        }

    }

    // console.log(programmes_select.options.value);

}

search_input.addEventListener('keyup', e => {
    toggleAll();
});

selectors.programmes_select.addEventListener('change', e => {
    toggleAll('programmes_select');
});

selectors.languages_select.addEventListener('change', e => {
    toggleAll('languages_select');
});

selectors.countries_select.addEventListener('change', e => {
    toggleAll('countries_select');
});

selectors.subtitles_select.addEventListener('change', e => {
    toggleAll('subtitles_select');
});

selectors.premieretypes_select.addEventListener('change', e => {
    toggleAll('premieretypes_select');
});

selectors.towns_select.addEventListener('change', e => {
    toggleAll('towns_select');
});

selectors.cinemas_select.addEventListener('change', e => {
    toggleAll('cinemas_select');
});

function unselect_all() {
    search_input.value = '';
    programmes_select.selectedIndex = 0;
    languages_select.selectedIndex = 0;
    countries_select.selectedIndex = 0;
    subtitles_select.selectedIndex = 0;
    premieretypes_select.selectedIndex = 0;
    towns_select.selectedIndex = 0;
    cinemas_select.selectedIndex = 0;
    nonetoshow.selectedIndex = 0;
    toggleAll(execute_filters());
}

function execute_filters() {
    let filtered = searcharray
        .filter(cassette => {
            if (programmes_select.value) {
                return cassette.programmes.includes(programmes_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (languages_select.value) {
                return cassette.languages.includes(languages_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (countries_select.value) {
                return cassette.countries.includes(countries_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (subtitles_select.value) {
                return cassette.subtitles.includes(subtitles_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (premieretypes_select.value) {
                return cassette.premieretypes.includes(premieretypes_select.value)
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (towns_select.value) {
                return cassette.towns.includes(parseInt(towns_select.value))
            } else {
                return true
            }
        })
        .filter(cassette => {
            if (cinemas_select.value) {
                return cassette.cinemas.includes(parseInt(cinemas_select.value))
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

// console.log('foo'.includes(undefined));


