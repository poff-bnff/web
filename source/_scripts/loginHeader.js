// // // var pageUrl = 'https://dev.inscaping.eu'
// // // var userprofilePageUrl = pageURL + '/userprofile/'

// var pageUrl = 'http://localhost:4000'
// var userprofilePageUrl = pageUrl + '/userprofile'

// // // var pageUrl = 'http://localhost:5000'
// // // var userprofilePageUrl = pageURL + '/userprofile'

// // console.log(localStorage.getItem('ID_TOKEN'));

var userProfile


if (localStorage.getItem('ID_TOKEN') !== null){
    document.getElementById('logOut').style.visibility = 'visible'
    document.getElementById('logInName').style.visibility = 'visible'
    // loadUserProfile();
}

if (localStorage.getItem('ID_TOKEN') === null){
    document.getElementById('logIn').style.visibility = 'visible'
}


function loadUserProfileH() {

    var response = fetch('https://api.poff.ee/profile', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
    });
    userProfile = response.json()
    console.log(userProfile)
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




