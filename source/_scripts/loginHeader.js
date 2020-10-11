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
    loadUserProfileH()
}

if (localStorage.getItem('ID_TOKEN') === null){
    document.getElementById('logIn').style.display = 'block'
    document.getElementById('signUp').style.display = 'block'
}


function loadUserProfileH() {

    var response1 = fetch('https://api.poff.ee/profile', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
    });
}


function saveUrl(){
    localStorage.setItem('url', window.location.href)
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




