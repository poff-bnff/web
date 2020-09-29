let userProfile ={}

let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let email = document.getElementById("email");

async function loadInfoFromIdtkn(){
    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')}
        });
        userProfile = await response.json()

        //return response.json()
        console.log(userProfile)
        firstName.value=userProfile.name
        lastName.value=userProfile.family_name
        email.value=userProfile.email
}
loadInfoFromIdtkn()









