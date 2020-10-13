
document.addEventListener("DOMContentLoaded", loadMyFavouriteFilms, false);

async function loadMyFavouriteFilms(e){

    var response = await fetch(`https://api.poff.ee/favourite`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        }
    });

    var favouriteFilms2 = await response.json()

    var film_cards = document.getElementsByClassName('card_film')
    for (var film_card of film_cards) {
        var filmId = parseInt(film_card.id)
        if (filmId in favouriteFilms2.films) {
            film_card.style.display = 'block'
        }
    }
}


async function removeFilm(movieId){
    console.log('removeFilm')
    console.log(movieId)

    var response = await fetch(`https://api.poff.ee/favourite/${movieId}`, {
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        }
    });

    let result = await response.json()
    console.log(result.todo);
}


