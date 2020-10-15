var favFilms
var movieId
var favouritePages = ['http://localhost:4000/films', 'http://localhost:4000/favourite']

document.addEventListener("DOMContentLoaded", loadMyFavFilms(), false);

function loadMyFavFilms(showFavFilms) {

    if (localStorage.getItem('ACCESS_TOKEN') === null) {
        return
    }

    console.log('loadMyFavFilms');

    if (window.location.href.indexOf("/film/") > -1 || favouritePages.includes(window.location.href)) {
        console.log('favourite page');
        fetchFavFilmsFromDB()
    }
}

function fetchFavFilmsFromDB() {
    console.log('fetchFavFilmsFromDB');
    var myHeaders = new Headers();
    myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };


    fetch('https://api.poff.ee/favourite', requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        saveFavFilms(data)
    }).catch(function (error) {
        console.warn(error);
    });
}


function saveFavFilms(data) {
    console.log('saveFavFilms');
    favFilms = data.films
    if (favouritePages.includes(window.location.href)) {
        showFavFilms()
        return
    }
    if (window.location.href.indexOf('/film/') > -1) {
        var filmCard = document.getElementsByClassName('grid_film')

        if (favFilms.includes(filmCard[0].id)) {
            changeFavInfo('put')
        } else {
            changeFavInfo('delete')
        }
    }
}



function showFavFilms() {
    console.log('showFavFilms')
    var filmCards = document.getElementsByClassName('card_film')

    for (var i = 0; i < filmCards.length; i++) {
        var filmId = filmCards[i].id

        if (window.location.href === 'http://localhost:4000/favourite' && favFilms.includes(filmId)) {
            console.log('match')
            filmCards[i].style.display = 'block'
        }

        if (window.location.href === 'http://localhost:4000/films') {
            document.getElementById(filmCards[i].id + 'nupp').style.display = 'block'
            if (favFilms.includes(filmId)) {
                console.log('fav');
                document.getElementById(filmCards[i].id + 'nupp').innerHTML = 'FAVO'
            }
        }
    }
}


function saveFilmAsFavourite(movieId) {
    console.log('saveFilm')

    var addBtnfilmCard = document.getElementById('nupp')

    if (window.location.href === 'http://localhost:4000/films') {
        addBtnfilmCard = document.getElementById(movieId + 'nupp')
    }

    if (addBtnfilmCard.innerHTML === '+') {
        console.log('save');

        var myHeaders = new Headers();
        myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch('https://api.poff.ee/favourite/' + movieId, requestOptions).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (data) {
            console.log(data)
            if (data.result === 'success') {
                changeFavInfo('put')
            }
        }).catch(function (error) {
            console.warn(error);
        });
    }
}

function changeFavInfo(status) {
    console.log(status)

    if (status === 'put') {
        document.getElementById('favouriteStatus').innerHTML = 'FAVO'
        document.getElementById('nupp').style.display = 'none'
        document.getElementById('removeFavBtn').style.display = 'block'
    }

    if (status === 'delete') {
        console.log('tere')
        document.getElementById('favouriteStatus').innerHTML = 'Lisa film lemmikuks!'
        document.getElementById('nupp').style.display = 'block'
        document.getElementById('removeFavBtn').style.display = 'none'
    }
}


function removeFilm(movieId) {
    console.log('removeFilm')
    console.log(movieId)

    var myHeaders = new Headers();

    myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };


    fetch('https://api.poff.ee/favourite/' + movieId, requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        console.log(data)
        console.log(movieId)
        console.log(data.movieId)
        if (movieId == data.movieId) {
            if (window.location.href.indexOf('/film/') > -1) {
                console.log('if')
                changeFavInfo('delete')
            } else {
                filmCard = document.getElementById(data.movieId)
                filmCard.style.display = 'none'
            }
        }
    }).catch(function (error) {
        console.warn(error);
    });
}
