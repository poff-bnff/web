function loadMyFavFilms() {
    console.log("FAVO: oled sisse loginud")
    try {
        document.getElementById('loggedOutFavouriteStatus').style.display = 'none'
    } catch (error) {
        null
    }

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
        return Promise.reject(response)
    }).then(function (shortlist_array) {
        // console.log(shortlist_array);
        showFavFilms(shortlist_array)
        console.log(shortlist_array)
        toggleFavButtons(shortlist_array)
    }).catch(function (error) {
        console.warn(error);
    });

}

function toggleFavButtons(shortlist_array) {
    console.log('toggleFavButtons')

    var isshortlisted_buttons = document.getElementsByClassName('isshortlisted')
    console.log(isshortlisted_buttons)

    for (i = 0; i < isshortlisted_buttons.length; i++) {
        var film_id = isshortlisted_buttons[i].id.split('_')[0]
        if (shortlist_array.includes(film_id)) {
            isshortlisted_buttons[i].style.display = 'block'
            document.getElementById(film_id + '_cassette_id').style.display = 'block'

        }
        else {
            isshortlisted_buttons[i].style.display = 'none'
        }
    }

    var notshortlisted_buttons = document.getElementsByClassName('notshortlisted')
    console.log(notshortlisted_buttons);

    for (i = 0; i < notshortlisted_buttons.length; i++) {
        var film_id = notshortlisted_buttons[i].id.split('_')[0]
        if (shortlist_array.includes(film_id)) {
            notshortlisted_buttons[i].style.display = 'none'
        }
        else {
            notshortlisted_buttons[i].style.display = 'block'
        }
    }


    // console.log('loadFavButtons')
    // document.getElementById('notFavouriteStatus').style.display = 'block'
    // document.getElementById('addToShortListButton').style.display = 'block'
}


// function saveFavFilms(shortlist_array) {

//     var favFilms = data
//     if (favouritePages.includes(window.location.pathname.slice(0, 10)) || favouritePages.includes(window.location.pathname.slice(0, 11))) {
//         showFavFilms(favFilms)
//         return
//     }
//     if (window.location.href.indexOf('/film/') > -1) {
//         var filmCard = document.getElementsByClassName('grid_film')
//         // console.log(filmCard)
//         // console.log(filmCard[0].id)
//         // console.log(favFilms)



//         if (favFilms.includes(filmCard[0].id)) {
//             changeFavInfo('put')
//         } else {
//             changeFavInfo('delete')
//         }
//     }
// }

function showFavFilms(shortlist_array) {
    console.log('showShortlist');

    var filmCards = document.getElementsByClassName('card_film')


    for (var i = 0; i < filmCards.length; i++) {
        console.log(1);
        var filmId = filmCards[i].id

        if (shortlist_array.includes(filmId)) {
            console.log(2);
            // filmCards[i].style.display = 'block'
        }
        //         else if (favFilms.length === 0 && document.getElementById('noFavouritesMessage')) {
        //             console.log(3);
        //             document.getElementById('noFavouritesMessage').style.display = 'block'
        //             return
        //         }
        //         if (window.location.href !== location.origin + '/favourite') {
        //             console.log(4);
        //             document.getElementById(filmCards[i].id + 'nupp').style.display = 'block'
        //             if (favFilms.includes(filmId)) {
        //                 // console.log('fav');
        //                 document.getElementById(filmCards[i].id + 'nupp').innerHTML = 'FAVO'
        //             }
        //         }
    }
}

function saveFilmAsFavourite(movieId) {
    console.log('saveFilmAsFavourite')

    // var addBtnfilmCard = document.getElementById('nupp')
    // console.log(addBtnfilmCard);

    if (window.location.href === location.origin + '/filmid') {
        // addBtnfilmCard = document.getElementById(movieId + 'nupp')
    }

    if (true) {

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
                document.getElementById(movieId + '_not_shortlisted').style.display = 'none'
                document.getElementById(movieId + '_is_shortlisted').style.display = 'block'
            }
        }).catch(function (error) {
            console.warn(error);
        });
    }
}



// function changeFavInfo(status, movieId) {


//     if (status === 'put' && favouritePages.includes(window.location.href)) {
//         document.getElementById(movieId + 'nupp').innerHTML = 'FAVO'
//         return
//     }

//     if (status === 'put') {
//         document.getElementById('nupp').style.display = 'none'
//         document.getElementById('removeFavBtn').style.display = 'block'
//     }

//     if (status === 'delete') {
//         document.getElementById('nupp').style.display = 'block'
//         document.getElementById('removeFavBtn').style.display = 'none'
//     }
// }

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
        console.log(data)
        if (data.ok) {
            try {
                document.getElementById(movieId + '_not_shortlisted').style.display = 'block'
                document.getElementById(movieId + '_is_shortlisted').style.display = 'none'
            }
            catch (err) {
                null
            }
            try {
                document.getElementById(movieId + '_cassette_id').style.display = 'none'
            }
            catch (err) {
                null
            }

            // changeFavInfo('delete')
            // else {
            // console.log('else');
            // filmCard = document.getElementById(movieId)
            // filmCard.style.display = 'none'

            // console.log(favFilms);

            // for (i = 0; i < favFilms.length; i++) {
            // if (favFilms[i] === movieId.toString()) {
            //     favFilms.pop(favFilms[i])
            //     // console.log(favFilms);

            // }
            // }

            // if (!favFilms.length) {
            // document.getElementById('noFavouritesMessage').style.display = 'block'
            // }

            // }
        }
    }).catch(function (error) {
        console.warn(error);
    });
}
