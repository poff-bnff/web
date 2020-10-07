async function loadUserProfileH() {

    var response = await fetch(`https://api.poff.ee/profile`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
        },
    });
    userProfile = await response.json()
    console.log(userProfile)
}
