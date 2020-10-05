const ACCESS_TOKEN = "ACCESS_TOKEN";
const ID_TOKEN = "ID_TOKEN";
const REFRESH_TOKEN = "REFRESH_TOKEN";
let url = window.location;

// let pageURL = 'https://dev.inscaping.eu'
// let userprofilePageURL = pageURL + '/userprofile/'

let pageURL = 'http://localhost:4000'
let userprofilePageURL = pageURL + '/userprofile'

// let pageURL = 'http://localhost:5000'
// let userprofilePageURL = pageURL + '/userprofile'


loadUserProfile()

if (window.location.hash) {
    const [access_token, id_token, token_type, token_expires] = (window.location.hash.substr(1)).split('&')

    if (access_token && id_token) {
        storeAuthentication(access_token.split('=')[1], id_token.split('=')[1])
    } else {
        console.log('Not sent ')
    }
}

async function storeAuthentication(access_token, id_token) {
    console.log('storeauth');
    localStorage.setItem(ACCESS_TOKEN, access_token);
    localStorage.setItem(ID_TOKEN, id_token);
    window.location.hash = '';
    location.reload();
}



async function loadUserProfile(){

    console.log('loadUserProfile');
    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')}
        });
        const USER_PROFILE = await response.json()
        console.log('USER_PROFILE in header: ' + JSON.stringify(USER_PROFILE))

        if ('email' in USER_PROFILE){
            hello.innerHTML = 'Hello, ' + USER_PROFILE.name
            out.innerHTML = '<a onclick="logOut()">Log out</a>'

        }
        // else {
        //     // hello.innerHTML = `<a href="${pageURL}/login"> Logi sisse</a>`
        //     return false
        // }
        CheckIfProfFilled(USER_PROFILE)


}


function CheckIfProfFilled(USER_PROFILE){
    console.log (USER_PROFILE)
    if (USER_PROFILE.profile_filled === "false"){
        console.log("profile unfilled")
        if (window.location.href != userprofilePageURL){
            window.open(`${pageURL}/userprofile`, "_self")
        }
    }
    else if (USER_PROFILE.profile_filled === "true") {
        console.log('profile filled')
        // window.open(`${pageURL}`, "_self")
    }
}

function logOut() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(ID_TOKEN);
    console.log('LOGITUD VÄLJA');
    location.reload();
}
