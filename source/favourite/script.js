
document.addEventListener("DOMContentLoaded", loadMyFavouriteFilms, false);

async function loadMyFavouriteFilms(e){
    console.log('hello');

    var response = await fetch(`https://api.poff.ee/favourite`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        }
    });

    var favouriteFilms2 = await response.json()

    console.log(response, 'loadmyFavs info ', favouriteFilms2.films)

    var film_cards = document.getElementsByClassName('card_film')
    for (var film_card of film_cards) {
        var filmId = parseInt(film_card.id)
        // console.log(filmId);
        if (filmId in favouriteFilms2.films) {
            film_card.style.display = 'block'
        }
    }
}


function removeFilm(){
    console.log('hello');
}


