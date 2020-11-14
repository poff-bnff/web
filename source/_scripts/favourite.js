function loadMyFavFilms() {
    // console.log("FAVO: oled sisse loginud")
    try {
        document.getElementById('loggedOutFavouriteStatus').style.display = 'none'
    } catch (error) {
        null
    }

    toggleFavButtons(userProfile.shortlist.map(function (item) { return item.cassette_id }))
    toggleSavedScreeningsButtons(userProfile.savedscreenings)



}

function toggleFavButtons(shortlist_array) {
    // console.log('toggleFavButtons')

    var isshortlisted_buttons = document.getElementsByClassName('isshortlisted')
    // console.log(isshortlisted_buttons)
    // console.log(shortlist_array)

    for (i = 0; i < isshortlisted_buttons.length; i++) {
        var film_id = isshortlisted_buttons[i].id.split('_')[0]
        // console.log(film_id, shortlist_array.includes(film_id));
        if (shortlist_array.includes(film_id)) {
            isshortlisted_buttons[i].style.display = 'block'
            document.getElementById(film_id + '_cassette_id').style.display = 'block'

        }
        else {
            isshortlisted_buttons[i].style.display = 'none'
        }
    }

    var notshortlisted_buttons = document.getElementsByClassName('notshortlisted')
    // console.log(notshortlisted_buttons);

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

function toggleSavedScreeningsButtons(savedScreenings) {

    var savedScreeningIds = []
    for (j = 0; j < savedScreenings.length; j++){
        savedScreeningIds.push(savedScreenings[j].screeningId)
    }

    console.log('savedScreeningIds ', savedScreeningIds)
    console.log('toggleSavedScreeningsButtons')
    console.log('savedScreenings ', savedScreenings)

    var isSavedScreening_buttons = document.getElementsByClassName('issavedscreening')
    console.log('isSavedScreening_buttons ', isSavedScreening_buttons)
    // console.log(shortlist_array)

    for (i = 0; i < isSavedScreening_buttons.length; i++) {
        var screening_id = isSavedScreening_buttons[i].id.split('_')[0]
        console.log(screening_id, savedScreeningIds.includes(screening_id))
        if (savedScreeningIds.includes(screening_id)) {
            isSavedScreening_buttons[i].style.display = 'block'
            document.getElementById(screening_id + '_screening_id').style.display = 'block'        }
        else {
            isSavedScreening_buttons[i].style.display = 'none'
        }
    }

    var notSavedScreening_buttons = document.getElementsByClassName('notsavedscreening')
    // console.log(notshortlisted_buttons);

    for (i = 0; i < notSavedScreening_buttons.length; i++) {
        var screening_id = notSavedScreening_buttons[i].id.split('_')[0]
        if (savedScreeningIds.includes(screening_id)) {
            notSavedScreening_buttons[i].style.display = 'none'
        }
        else {
            notSavedScreening_buttons[i].style.display = 'block'
        }
    }

}


function saveFilmAsFavourite(movieId) {
    // console.log('saveFilmAsFavourite')

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

function saveScreeningAsFavourite(screeningId, screeningTitle, screeningTime) {
    console.log('screeningId ', screeningId)
    console.log('screeningTitle ', screeningTitle)
    console.log('screeningTime ', screeningTime)

    var screening = {
        id: screeningId,
        screeningTitle: screeningTitle,
        screeningTime: screeningTime
    }


    // var myHeaders = new Headers();
    // myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
        method: 'PUT',
        // headers: myHeaders,
        redirect: 'follow',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(screening)

    };

    console.log(requestOptions)

    fetch('https://api.poff.ee/favourite/' + screeningId, requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        if (data.ok) {
            document.getElementById(screeningId + '_not_savedscreening').style.display = 'none'
            document.getElementById(screeningId + '_is_savedscreening').style.display = 'block'
        }
    }).catch(function (error) {
        console.warn(error);
    });
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

function removeScreening(screeningId) {
    console.log('saveFilmAsFavourite screeningId ', screeningId)

    var myHeaders = new Headers();

    myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };


    fetch('https://api.poff.ee/favourite/' + 'screening_' + screeningId, requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        console.log(data)
        if (data.ok) {
            try {
                document.getElementById(screeningId + '_not_savedscreening').style.display = 'block'
                document.getElementById(screeningId + '_is_savedscreening').style.display = 'none'
            }
            catch (err) {
                null
            }
            try {
                // document.getElementById(movieId + '_cassette_id').style.display = 'none'
            }
            catch (err) {
                null
            }
        }
    }).catch(function (error) {
        console.warn(error);
    });
}
