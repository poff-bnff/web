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
        }
    }).catch(function (error) {
        console.warn(error);
    });
}
