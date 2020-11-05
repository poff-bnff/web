var pageURL = location.origin
var userprofilePageURL = pageURL + '/userprofile'
var userProfile
var validToken = false

if(localStorage.getItem('ACCESS_TOKEN')){
    var token = localStorage.getItem('ACCESS_TOKEN')
    try{
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        // var parsedToken = JSON.parse(jsonPayload)
        // console.log("token: ", parsedToken)
        var expDate = JSON.parse(jsonPayload).exp * 1000
        var now = new Date().getTime()

        console.log("token aegub: " + expDate)
        console.log("praegu on: " + now)

        if(now < expDate){
            validToken = true
        }else{
            validToken = false
        }
    }
    catch(err){
        //console.log(err)
        validToken = false
    }
}
console.log("valid token?",validToken)


if (validToken){
    document.getElementById('logOut').style.display = 'block'
    document.getElementById('logInName').style.display = 'block'
    document.getElementById('myFavouriteFilms').style.display = 'block'
    document.getElementById('userProfile').style.display = 'block'

    loadUserProfileH()
}

if (!validToken){
    document.getElementById('logIn').style.display = 'block'
    document.getElementById('signUp').style.display = 'block'
}


function loadUserProfileH() {
    console.log('laen cognitost kasutaja profiili....')
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
        console.log("cognitos olev profiil:")
        console.log(userProfile);

    }).catch(function (error) {
        console.warn(error);
    });
}


function saveUrl(){
    if(window.location.href !== loacation.origin + "userprofile"){
        localStorage.setItem('url', window.location.href)
    }
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

    window.open(location.origin, '_self')
}

