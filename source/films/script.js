document.addEventListener("DOMContentLoaded", loadMyFavouriteFilms1, false);


async function loadMyFavouriteFilms1(e) {
    console.log('ins');

    if (localStorage.getItem('ACCESS_TOKEN') === null){
        return
    }

    var film_cards = document.getElementsByClassName('card_film')
    for (let i of film_cards){
        document.getElementById(i.id + 'nupp').style.display = 'block'
    }

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
        addBtnfilmCard.style.display = 'block'
        addBtnfilmCard.innerHTML = 'FAVO'
    }
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
        let reply = await response.json()

        if (reply.result === 'success') {
            addBtnfilmCard.innerHTML = 'FAVO'
        }
    }
}


