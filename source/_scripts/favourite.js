var favFilms
var favouritePages = [location.origin + '/favourite', location.origin + '/filmid/', location.origin + '/pohivoistlusprogramm/',]

// document.addEventListener("load", loadMyFavFilms());



// // window.addEventListener('load', (event) => {
// //     console.log('page is fully loaded');
// //     loadMyFavFilms()
// //   });

// function loadMyFavFilms() {
//     console.log('validToken is fully loaded')
//     if (validToken) {
//         console.log("FAVO: oled sisse loginud")
//         document.getElementById('noFavouritesMessage').style.display = 'block'
//     }
//     if(!validToken){
//         console.log("FAVO: pole sisse loginud")
//         document.getElementById('loginForFavo').style.display = 'block'
//     }
// }

function fetchFavFilmsFromDB() {
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
        console.log(data);
        saveFavFilms(data)
    }).catch(function (error) {
        console.warn(error);
    });
}

function saveFavFilms(data) {
    favFilms = data
    if (favouritePages.includes(window.location.href)) {
        showFavFilms()
        return
    }
    if (window.location.href.indexOf('/film/') > -1) {
        var filmCard = document.getElementsByClassName('grid_film')
        console.log(filmCard)
        console.log(filmCard[0].id)
        console.log(favFilms)



        if (favFilms.includes(filmCard[0].id)) {
            changeFavInfo('put')
        } else {
            changeFavInfo('delete')
        }
    }
}

function showFavFilms() {
    console.log('showFavFilms');

    var filmCards = document.getElementsByClassName('card_film')

    for (var i = 0; i < filmCards.length; i++) {
        var filmId = filmCards[i].id

        if (window.location.href === location.origin + '/favourite' && favFilms.includes(filmId)) {
            filmCards[i].style.display = 'block'
        }
        else if (window.location.href === location.origin + '/favourite' && favFilms.length === 0) {
            document.getElementById('noFavouritesMessage').style.display = 'block'
        }
        if (window.location.href !== location.origin + '/favourite') {
            document.getElementById(filmCards[i].id + 'nupp').style.display = 'block'
            if (favFilms.includes(filmId)) {
                console.log('fav');
                document.getElementById(filmCards[i].id + 'nupp').innerHTML = 'FAVO'
            }
        }
    }
}

function saveFilmAsFavourite(movieId) {
    console.log('saveFilmAsFavourite')

    var addBtnfilmCard = document.getElementById('nupp')
    console.log(addBtnfilmCard);

    if (window.location.href === location.origin + '/filmid') {
        addBtnfilmCard = document.getElementById(movieId + 'nupp')
    }

    if (addBtnfilmCard.innerHTML === '+') {

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
            if (data.ok) {
                changeFavInfo('put', movieId)
            }
        }).catch(function (error) {
            console.warn(error);
        });
    }
}



function changeFavInfo(status, movieId) {

    if (status === 'put' && favouritePages.includes(window.location.href)) {
        document.getElementById(movieId + 'nupp').innerHTML = 'FAVO'
        return
    }

    if (status === 'put') {
        document.getElementById('favouriteStatus').innerHTML = 'FAVO'
        document.getElementById('nupp').style.display = 'none'
        document.getElementById('removeFavBtn').style.display = 'block'
    }

    if (status === 'delete') {
        document.getElementById('favouriteStatus').innerHTML = 'Lisa film lemmikuks!'
        document.getElementById('nupp').style.display = 'block'
        document.getElementById('removeFavBtn').style.display = 'none'
    }
}

function removeFilm(movieId) {
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
        if (data.ok) {
            if (window.location.href.indexOf('/film/') > -1) {
                changeFavInfo('delete')
            } else {
                console.log('else');
                filmCard = document.getElementById(movieId)
                filmCard.style.display = 'none'

                console.log(favFilms);

                for (i = 0; i < favFilms.length; i++) {
                    if (favFilms[i] === movieId.toString()) {
                        favFilms.pop(favFilms[i])
                        console.log(favFilms);

                    }
                }

                if (!favFilms.length) {
                    document.getElementById('noFavouritesMessage').style.display = 'block'
                }

            }
        }
    }).catch(function (error) {
        console.warn(error);
    });
}
