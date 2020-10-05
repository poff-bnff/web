var hello = 'helloVar'

// let hello = 'helloLet'
console.log(hello)


// // var pageUrl = 'https://dev.inscaping.eu'
// // var userprofilePageUrl = pageURL + '/userprofile/'

var pageUrl = 'http://localhost:4000'
var userprofilePageUrl = pageURL + '/userprofile'

// // var pageUrl = 'http://localhost:5000'
// // var userprofilePageUrl = pageURL + '/userprofile'

// console.log(localStorage.getItem('ID_TOKEN'));


if (localStorage.getItem('ID_TOKEN') != null){
    document.getElementById("logIn").style.visibility = "hidden"
}

if (localStorage.getItem('ID_TOKEN') == null){
    document.getElementById("logOut").style.visibility = "hidden"
}

function saveUrl(){
    localStorage.setItem('url', window.location.href)
}

function logOut() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(ID_TOKEN);
    console.log('LOGITUD VÄLJA');
    location.reload();
}




