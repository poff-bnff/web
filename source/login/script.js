// let pageURL = 'https://dev.inscaping.eu'
// let userprofilePageURL = pageURL + '/userprofile/'

let pageURL = 'http://localhost:4000'
let userprofilePageURL = pageURL + '/userprofile'

// let pageURL = 'http://localhost:5000';
// let userprofilePageURL = pageURL + '/userprofile';


if (window.location.hash) {
    const [
        access_token,
        id_token,
        token_type,
        token_expires,
    ] = window.location.hash.substr(1).split('&')

    if (access_token && id_token) {
        storeAuthentication(access_token.split('=')[1], id_token.split('=')[1])
    }
}


async function storeAuthentication(access_token, id_token) {
    localStorage.setItem('ACCESS_TOKEN', access_token)
    localStorage.setItem('ID_TOKEN', id_token)
    await loadUserProfile()
    window.location.hash = ''
}


async function loadUserProfile() {
    let userProfile

    let response = await fetch(`https://api.poff.ee/profile`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
    });
    userProfile = await response.json()
    checkIfUserProfFilled(userProfile)
    console.log(userProfile)
}


function checkIfUserProfFilled(userProfile){

    if ('profile_filled' in userProfile) {
        console.log('profile filled')
        redirectToPreLoginUrl()
    } else {
        console.log('profile not filled')
        window.open(`${pageURL}/userprofile`, '_self')
    }
}


function redirectToPreLoginUrl() {
    if (localStorage.getItem('url')) {
            let url = localStorage.getItem('url')
            localStorage.removeItem('url')
            window.open(url, '_self')
        }
        else {
            window.open(pageURL, '_self')
        }
    }