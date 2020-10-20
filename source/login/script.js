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

if (location.search){
    getTokensForCode()

}

// salvesta timestamp
//kasutaja nimi
// autentimis päring api vastu (email ja parool, sinna, tagasi token ja timestamp

async function storeAuthentication(access_token, id_token) {
    localStorage.setItem('ACCESS_TOKEN', access_token)
    localStorage.setItem('ID_TOKEN', id_token)
    await loadUserProfile()
    window.location.hash = ''
}


async function loginViaCognito(){

    let authenticationData = {userName: document.getElementById("loginUsername").value,
     password: document.getElementById("loginPassword").value}

     console.log(authenticationData)

    let response = await fetch(`https://api.poff.ee/auth`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
        body: JSON.stringify(authenticationData)
    });

    let response2 = await response.json()
    console.log(response2.AccessToken)
    access_token = response2.AccessToken
    id_token = response2.IdToken

    storeAuthentication(access_token, id_token)

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


async function providerLogin(provider){
    console.log('providerLogin' + provider);

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    }

    let providers = ['facebook', 'google', 'eventival']
    let response = await fetch(`https://api.poff.ee/auth/${providers[provider]}`, requestOptions)

    let response2 = await response.json()
    console.log(response2)

    window.open(response2.providerUrl, '_self')
}


async function getTokensForCode(){
    var requestOptions = {
        method: 'POST',
        redirect: 'follow'
    }

    let response = await fetch(`https://api.poff.ee/auth`, requestOptions)

    console.log(await response.json)

}
