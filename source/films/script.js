document.addEventListener("DOMContentLoaded", loadMyFavouriteFilms1, false);

async function loadMyFavouriteFilms1(e) {
    console.log('ins');
    let addBtnfilmCard

    var response = await fetch(`https://api.poff.ee/favourite`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        }
    });

    var favouriteFilms = await response.json()
    console.log(favouriteFilms);

    for (let favouriteFilm of favouriteFilms.films){
        addBtnfilmCard = document.getElementById(favouriteFilm + 'nupp')
        addBtnfilmCard.innerHTML = 'FAVO'
    }


    // for (var film_card of film_cards) {
    //     var filmId = film_card.id

    //     if (favouriteFilms.films.includes(filmId)) {
    //         film_card.style.display = 'block'
    //     }
    // }
}





async function saveAsFavorite(movieId) {

    let addBtnfilmCard = document.getElementById(movieId + 'nupp')

    if (addBtnfilmCard.innerHTML === '+') {

        let response = await fetch(`https://api.poff.ee/favourite/${movieId}`, {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
            }
        });
        // console.log(await response.json())
        let reply = await response.json()

        if (reply.result === 'success') {
            addBtnfilmCard.innerHTML = 'FAVO'
        }
    }
}


