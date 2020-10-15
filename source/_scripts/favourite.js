var favFilms

document.addEventListener("DOMContentLoaded", loadMyFavFilms(), false);

function loadMyFavFilms(showFavFilms) {

    if (localStorage.getItem('ACCESS_TOKEN') === null) {
        return
    }

    console.log('loadMyFavFilms');
    if (window.location.href === 'http://localhost:4000/favourite' || 'http://localhost:4000/films') {
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
    showFavFilms()
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
                changeFavInfo(movieId, 'put')
            }
        }).catch(function (error) {
            console.warn(error);
        });
    }
}

function changeFavInfo(movieId, status) {
    console.log(status);

    if (status === 'put') {
        console.log('putin');
        document.getElementById('favouriteStatus').innerHTML = 'FAVO'
        document.getElementById('nupp').style.display = 'none'
        document.getElementById('removeFavBtn').style.display = 'block'
    }

    if (document.getElementById('favouriteStatus').innerHTML === 'FAVO') {
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
        console.log(data);
        if (movieId == data.movieId) {
            var filmCard = document.getElementById(data.movieId)
            filmCard.style.display = 'none'
            changeFavInfo()
        }
    }).catch(function (error) {
        console.warn(error);
    });
}
