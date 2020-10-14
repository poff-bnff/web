var favFilms

document.addEventListener("DOMContentLoaded", loadMyFavFilms(), false);

function loadMyFavFilms(showFavFilms){
    console.log('loadMyFavFilms');
    if (window.location.href === 'http://localhost:4000/favourite'){
        console.log('favourite page');
        fetchFavFilmsFromDB()
    }
}

function fetchFavFilmsFromDB(){
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


function saveFavFilms(data){
    console.log('saveFavFilms');
    favFilms = data.films
    showFavFilms()
}



function showFavFilms(){
    console.log('showFavFilms')
    var filmCards = document.getElementsByClassName('card_film')

    for (var i = 0; i<filmCards.length; i++) {
        var filmId = filmCards[i].id

        if (favFilms.includes(filmId)) {
            console.log('match')
            filmCards[i].style.display = 'block'
        }
    }
}


// function saveAsFavourite2(saveAsFavourite0){
//     console.log('hello');
//     var myHeaders = new Headers();
//     myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'));

//     var requestOptions = {
//       method: 'GET',
//       headers: myHeaders,
//       redirect: 'follow'
//     };

//     var array2;

//     var response = fetch("https://api.poff.ee/favourite", requestOptions);

//     saveAsFavourite0(response);

// }


// function saveAsFavourite0(response){
//     console.log(response.PromiseState);

// }


