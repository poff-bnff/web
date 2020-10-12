let favouriteFilms2;

document.addEventListener("DOMContentLoaded", theDomHasLoaded, false);

window.addEventListener("load", pageFullyLoaded, false);


async function theDomHasLoaded(e){
    await loadMyFavouriteFilms()
}

function pageFullyLoaded(e) {
    loadMyFavs()
}

async function loadMyFavs() {
    console.log('loadmyFavs info ', favouriteFilms2.films)

    var films = document.getElementsByClassName('card_film')
    for (let film of films) {
        let filmId = parseInt(film.id)
        console.log(filmId);
        if (filmId in favouriteFilms2.films) {
            film.style.display = 'block'
        }
    }
}




async function loadMyFavouriteFilms() {
    console.log('hello');

    let response = await fetch(`https://api.poff.ee/favourite`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        }
        // body: JSON.stringify(authenticationData)
    });

    favouriteFilms2 = await response.json()
    // console.log(favouriteFilms2.films)
    return favoriteFilms2
}
