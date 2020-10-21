
const search_input = document.getElementById('search');
const results = document.getElementById('results');

let search_term = ''
let cassettes;

const showFilms = async () => {

    let oneFilm = document.querySelectorAll('[class="card_film"]');

    for (let film of oneFilm) {

        let title = film.querySelector('#title') ? film.querySelector('#title').innerHTML.toLowerCase() : ''
        let programme = film.querySelector('#programmes') ? film.querySelector('#programmes').innerHTML.toLowerCase() : ''

        if (title.includes(search_term.toLowerCase()) || programme.includes(search_term.toLowerCase())) {
            film.style.display = "grid";
        } else {
            if (search_term.toLowerCase().length > 0) {
                film.style.display = "none";
            } else {
                film.style.display = "grid";
            }
        }
    }

};

showFilms();

search_input.addEventListener('keyup', e => {
    search_term = e.target.value;

    showFilms();
});
