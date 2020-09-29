

let profileImg = document.getElementById("profileImg")
let firstName = document.getElementById("firstName")
let lastName = document.getElementById("lastName")
let dob = document.getElementById("dob")
let phoneNr = document.getElementById("phoneNr")
let email = document.getElementById("email")
let country = document.getElementById("country")
let city = document.getElementById("city")

async function LoadUserInfo(){
    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')}
        });
        userProfile = await response.json()

        firstName.value=userProfile.name
        lastName.value=userProfile.family_name
        email.value=userProfile.email
}
LoadUserInfo()



function sendUserProfile(){
    //siin panen kokku listi objektidest mida saata cognitosse
    //Kas järjekord on oluline?
    //kas Name-id on kõik õiged?
    let userToSend=[
        {Name: "picture", Value: profileImg.value},
        {Name: "name", Value: firstName.value},
        {Name: "family_name", Value: lastName.value},
        {Name: "gender", Value: $('input[name="gender"]:checked').val()},
        {Name: "birthdate", Value: dob.value},
        {Name: "phone", Value: phoneNr.value},
        {Name: "email", Value: email.value},
        {Name: "address", Value: `${country.value}, ${city.value}`},
        ]

    console.log(userToSend)
}











