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
    document.getElementById("login").style.visibility = "hidden"
}




