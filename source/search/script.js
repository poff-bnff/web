
const search_input = document.getElementById('search');
const programme_select = document.getElementById('programmesSelect');
const language_select = document.getElementById('languagesSelect');

function toggleAll(ids) {

    let cards = document.querySelectorAll('[class="card_film"]')
    cards.forEach(card => {
        console.log(typeof ids[0], ' - ',typeof card.id);
        if (ids.includes(card.id)) {
            card.style.display = "grid"
        } else {
            card.style.display = "none"
        }
    })

    // toggleFilters()
}

function toggleFilters() {
    for (const option of programme_select.options) {
        const value = option.value

        let count = searcharray
        .filter(cassette => cassette.programmes.includes(value))
        .filter(cassette => cassette.languages.includes(language_select.value))
        .filter(cassette => cassette.text.includes(search_input.value.toLowerCase())).length
        option.innerHTML += count
        option.disabled = count
    }
    console.log(programme_select.options.value);
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
        .filter(cassette => cassette.text.includes(search_input.value.toLowerCase()))
        .map(element => element.id.toString());
    // console.log(filtered);
    // console.log(filtered.map(element => element.id));
    return filtered
}

console.log('foo'.includes(undefined || ''));
