
let profileImg = document.getElementById("profileImg")
let firstName = document.getElementById("firstName")
let lastName = document.getElementById("lastName")
let dob = document.getElementById("dob")
let phoneNr = document.getElementById("phoneNr")
let email = document.getElementById("email")
let country = document.getElementById("country")
let city = document.getElementById("city")


function validateEmail() {
    var emailval = document.getElementById("email").value
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(re.test(String(emailval).toLowerCase()))

    if (!re.test(String(emailval).toLowerCase())) {
        document.getElementById("email").classList.add("invalid")
    } else {
        document.getElementById("email").classList.remove("invalid")
    }
}
function validatePhoneNr() {
    let phoneNr = document.getElementById("phoneNr").value
    const regex = /^(?:\+\d{1,3}|0\d{1,3}|00\d{1,2})?(?:\s?\(\d+\))?(?:[-\/\s.]|\d)+$/
    console.log(regex.test(String(phoneNr).toLowerCase()))

    // if (!re.test(String(emailval).toLowerCase())) {
    //     document.getElementById("email").classList.add("invalid")
    // } else {
    //     document.getElementById("email").classList.remove("invalid")
    // }
}

function valdateBDay(){
    let dob = document.getElementById("dob").value
    let minAge = ((date.getMonth()+1 ) + '-' + (date.getDate()) + '-' + (date.getFullYear()-12))
    let maxAge = ((date.getMonth()+1 ) + '-' + (date.getDate()) + '-' + (date.getFullYear()-112))
    if(dob > minAge || dob < maxAge ){
        document.getElementById("dob").classList.add("invalid")
    }else {
        document.getElementById("dob").classList.remove("invalid")
    }
}

function validateForm() {
    console.log('validate form')
    let profileImg = document.getElementById("profileImg").value
    let firstName = document.getElementById("firstName").value
    let lastName = document.getElementById("lastName").value
    let dob = document.getElementById("dob").value
    let phoneNr = document.getElementById("phoneNr").value
    let email = document.getElementById("email").value
    let country = document.getElementById("country").value
    let city = document.getElementById("city").value
    console.log(country)
    if (country == ""){
        console.log(country, ' countryif')
        document.getElementById("country").classList.add("invalid")
        country.value='Elukoha riik'
    }
    if(firstName == '' || firsttName.length < 2 || !isNaN(firsttName)){
        document.getElementById("firstName").classList.add("invalid")
    }
    if(lastName == '' || lasttName.length < 2 || !isNaN(lasttName)){
        document.getElementById("lastName").classList.add("invalid")
    }
    if(city == ''){
        document.getElementById("city").classList.add("invalid")
    }

}



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
        // country.value='Elukoha riik'
}
LoadUserInfo()

async function sendUserProfile(){
    //siin panen kokku listi objektidest mida saata cognitosse
    //Kas järjekord on oluline?
    //kas Name-id on kõik õiged?
    let userToSend=[
        {Name: "picture", Value: profileImg.value},
        {Name: "name", Value: firstName.value},
        {Name: "family_name", Value: lastName.value},
        {Name: "gender", Value: $('input[name="gender"]:checked').val()},
        {Name: "birthdate", Value: dob.value},
        {Name: "phone_number", Value: phoneNr.value},
        {Name: "email", Value: email.value},
        {Name: "address", Value: `${country.value}, ${city.value}`},
        ]

    // let userToSend={
    //     picture: profileImg.value,
    //     name: firstName.value,
    //     family_name: lastName.value,
    //     gender: $('input[name="gender"]:checked').val(),
    //     birthdate: dob.value,
    //     phone: phoneNr.value,
    //     email: email.value,
    //     address: `${country.value}, ${city.value}`
    // }

    console.log(userToSend)

    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')},
            body: JSON.stringify(userToSend)
        });
        userProfile = await response.json()
}











