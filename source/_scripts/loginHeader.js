// var pageURL = 'https://dev.inscaping.eu'
// var userprofilePageURL = pageURL + '/userprofile/'

var pageURL = 'http://localhost:4000'
var userprofilePageURL = pageURL + '/userprofile'

// var pageURL = 'http://localhost:5000';
// var userprofilePageURL = pageURL + '/userprofile';

var userProfile

if (localStorage.getItem('ID_TOKEN') !== null){
    document.getElementById('logOut').style.display = 'block'
    document.getElementById('logInName').style.display = 'block'
    document.getElementById('myFavouriteFilms').style.display = 'block'
    document.getElementById('userProfile').style.display = 'block'

    loadUserProfileH()
}

if (localStorage.getItem('ID_TOKEN') === null){
    document.getElementById('logIn').style.display = 'block'
    document.getElementById('signUp').style.display = 'block'
}


function loadUserProfileH() {
    console.log('loadUserProfileH')
    var myHeaders = new Headers()
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'))


    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }


    fetch('https://api.poff.ee/profile', requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        userProfile = data
        useUserData(data)
        console.log(userProfile);

    }).catch(function (error) {
        console.warn(error);
    });

}


function saveUrl(){
    localStorage.setItem('url', window.location.href)
}


function useUserData(userProf){
    document.getElementById('logInName').innerHTML = 'Tere, ' + userProf.name
}


function logOut() {
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('ID_TOKEN')

    if (localStorage.getItem('REFRESH_TOKEN')){
        localStorage.removeItem('REFRESH_TOKEN')
    }
    localStorage.removeItem('url')
    localStorage.removeItem('USER_PROFILE')

    console.log('LOGITUD VÄLJA')
    location.reload()
}
