
const search_input = document.getElementById('search');
const festival_select = document.getElementById('festivalsSelect');
const programme_select = document.getElementById('programmesSelect');
const results = document.getElementById('results');

let search_term = ''
let festival_term = ''
let programme_term = ''
let cassettes;

var selectFestivals = document.querySelector('#festivalsSelect');
var festivals = document.getElementById('festivals').value.split(',')

selectFestivals.options.add(new Option('Festival:'));
for(const festIx in festivals){
    console.log(festivals[festIx]);
    selectFestivals.options.add(new Option(festivals[festIx]));
}

var selectProgrammes = document.querySelector('#programmesSelect');
var programmes = document.getElementById('festivalProgrammes').value.split(',')

selectProgrammes.options.add(new Option('Programm:'));
for(const progIx in programmes.sort(function(a, b){ if(a && b) { return ('' + a).localeCompare(b); } else { return 0; } })){
    selectProgrammes.options.add(new Option(programmes[progIx]));
}

const showFilms = async () => {

    let oneFilm = document.querySelectorAll('[class="card_film"]');

    for (let film of oneFilm) {

        let title = film.querySelector('#title') ? film.querySelector('#title').innerHTML.toLowerCase() : ''
        let programme = film.querySelector('#programmes') ? film.querySelector('#programmes').innerHTML.toLowerCase() : ''
        let festival = film.querySelector('#festivalsCassette') ? film.querySelector('#festivalsCassette').value.toLowerCase() : ''

        let searchVal = false
        let chooseFestVal = false
        let chooseProgVal = false
        if (search_term.length > 0) {
            searchVal = search_term.length > 0 ? true : false
        }
        if (festival_term !== 'Festival:') {
            chooseFestVal = festival_term !== '' ? true : false
        }
        if (programme_term !== 'Programm:') {
            chooseProgVal = programme_term !== '' ? true : false
        }

        let displayPerSearch = title.includes(search_term.toLowerCase()) || programme.includes(search_term.toLowerCase())
        let displayPerFest = festival.includes(festival_term.toLowerCase())
        let displayPerProg = programme.includes(programme_term.toLowerCase())


        if (!searchVal && !chooseFestVal && !chooseProgVal) {
            film.style.display = "grid";
        } else if (searchVal) {
            if(chooseFestVal && !chooseProgVal) {
                displayPerFest && displayPerSearch ? film.style.display = "grid" : film.style.display = "none"
            }else if(chooseProgVal && !chooseFestVal) {
                displayPerProg && displayPerSearch ? film.style.display = "grid" : film.style.display = "none"
            }else if(chooseProgVal && chooseFestVal) {
                displayPerProg && displayPerSearch && displayPerFest ? film.style.display = "grid" : film.style.display = "none"
            }else{
                displayPerSearch ? film.style.display = "grid" : film.style.display = "none";
            }
        } else {
            if(chooseFestVal && !chooseProgVal) {
                displayPerFest ? film.style.display = "grid" : film.style.display = "none"
            }else if(chooseProgVal && !chooseFestVal) {
                displayPerProg ? film.style.display = "grid" : film.style.display = "none"
            }else if(chooseProgVal && chooseFestVal) {
                displayPerProg && displayPerFest ? film.style.display = "grid" : film.style.display = "none"
            }else{
                film.style.display = "none";
            }
        }

        // if(displayPerFest || displayPerProg) {
        //     if ((displayPerSearch && displayPerFest && displayPerProg)) {
        //        film.style.display = "grid";
        //     } else {

        //     }
        // }

        // if (displayPerSearch) {
        //     console.log(displayPerSearch, 'search');
        //     if (displayPerFest || festival_term === 'Festival:') {
        //         console.log(displayPerSearch, 'fest');
        //         film.style.display = "grid";
        //     } else {
        //         film.style.display = "none";
        //     }

        //     if (displayPerProg || programme_term === 'Programm:') {
        //         console.log(displayPerProg, 'prog');
        //         film.style.display = "grid";
        //     } else {
        //         film.style.display = "none";
        //     }
        // } else {
        //     film.style.display = "none";

        // }

        // if (displayPerProg) {
        //     film.style.display = "grid";
        // } else {
        //     film.style.display = "none";
        // }


        // if (title.includes(search_term.toLowerCase()) || programme.includes(search_term.toLowerCase()) || festival.includes(festival_term.toLowerCase()) || festival_term === 'Festival:') {
        //     console.log('onküllllll');
        //     film.style.display = "grid";
        // } else {
        //     if (search_term.toLowerCase().length > 0 || festival_term.toLowerCase().length > 0) {
        //         film.style.display = "none";
        //     } else {
        //         film.style.display = "grid";
        //     }
        // }
    }

};

showFilms();

search_input.addEventListener('keyup', e => {
    search_term = e.target.value;

    showFilms();
});
festival_select.addEventListener('change', e => {
    festival_term = e.target.value;
    showFilms();
});
programme_select.addEventListener('change', e => {
    programme_term = e.target.value;
    showFilms();
});
