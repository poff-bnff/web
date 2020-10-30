var email = document.getElementById("email");
var psw = document.getElementById("psw");
var psw2 = document.getElementById("psw2");
var pswds = document.getElementById('pswds');
var firstName = document.getElementById("firstName");
var lastName = document.getElementById("lastName");
var gender = document.getElementById("gender");
var dob = document.getElementById("dob");
var phoneNr = document.getElementById("phoneNr");
var country = document.getElementById("countrySelection");
var city = document.getElementById("gds-cr-one");



function validateForm() {

    var errors = []

    if (document.getElementById('profileSent')){
    document.getElementById('profileSent').style.display = 'none'
    }


    if (!validateEmail()) {
        errors.push('Missing or invalid email')

    }
    if (psw && !validatePsw()) {
        errors.push('Missing or invalid password')
    }

    if (psw2 && !validatePswRep()) {
        errors.push('Missing or invalid password repeat')
    }

    if (!validateFirstName()) {
        errors.push('Missing firstname')


    }

    if (!validateLastName()) {
        errors.push('Missing lastname')


    }

    if (!validateGender()) {
        errors.push('Missing gender')
    }

    if (!validateBDay()) {
        errors.push('Missing or invalid date of birth')
    }

    if (!validatePhoneNr()) {
        errors.push('Missing phonenumber')
    }

    if (!validateCountry()) {
        errors.push('Missing country')
    }

    if (!validateCity()) {
        errors.push('Missing city')
    }

    console.log(errors)
    if (errors.length === 0) {

        if (window.location.href === userprofilePageURL) {
            sendUserProfile()
        } else {
            sendNewUser()
        }
    }
}

function validateEmail() {

    var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!emailRe.test(String(email.value).toLowerCase())) {

        emailHelp.classList.remove("valid")
        emailHelp.classList.add("invalid")
        return false
    }
    else {
        emailHelp.classList.remove("invalid")
        emailHelp.classList.add("valid")

        return true
    }
}

function validatePsw() {

    if (psw.value === "") {
        pswHelp.classList.remove("valid")
        pswHelp.classList.add("invalid")


        validatePswRep()
        return false
    }

    var pswdRe = /^.{8,}$/

    if (!pswdRe.test(String(psw.value))) {
        pswHelp.classList.remove("valid")
        pswHelp.classList.add("invalid")

        validatePswRep()
        return true
    }
    else {
        pswHelp.classList.remove("invalid")
        pswHelp.classList.add("valid")

        validatePswRep()
        return true
    }
}

function validatePswRep() {
    if (psw2.value === "") {
        psw2Help.classList.remove("valid")
        psw2Help.classList.add("invalid")

        return false
    }

    if (psw.value !== psw2.value) {
        psw2Help.classList.remove("valid")
        psw2Help.classList.add("invalid")
        return false
    } else {
        psw2Help.classList.remove("invalid")
        psw2Help.classList.add("valid")


        return true
    }
}

function validateFirstName() {

    if (firstName.value == "" || firstName.value.length < 2 || !isNaN(firstName.value)) {
        firstNameHelp.classList.remove("valid")
        firstNameHelp.classList.add("invalid")
        return false
    }
    firstNameHelp.classList.remove("invalid")
    firstNameHelp.classList.add("valid")


    return true
}

function validateLastName() {

    if (lastName.value === "" || lastName.value.length < 2 || !isNaN(lastName.value)) {
        lastNameHelp.classList.remove("valid")
        lastNameHelp.classList.add("invalid")
        return false
    }
    lastNameHelp.classList.remove("invalid")
    lastNameHelp.classList.add("valid")


    return true
}


function validateGender() {

    if (gender.value === "") {

        genderHelp.classList.remove("valid")
        genderHelp.classList.add("invalid")


        return false
    }

    if (gender.value !== "") {
        genderHelp.classList.remove("invalid")
        genderHelp.classList.add("valid")


        return true
    }
}

function validateBDay() {
    if (dob.value === "") {
        dobHelp.classList.remove("valid")
        dobHelp.classList.add("invalid")

        return false
    }

    var userAge = getAge(dob.value)

    if (userAge > 12 && userAge < 116) {
        dobHelp.classList.remove("invalid")
        dobHelp.classList.add("valid")

        return true
    } else {
        dobHelp.classList.remove("valid")
        dobHelp.classList.add("invalid")


        return false
    }
}

function validatePhoneNr() {
    if (phoneNr.value === "") {

        phoneNrHelp.classList.remove("valid")
        phoneNrHelp.classList.add("invalid")

        return false
    }

    var phoneRe = /^[0-9]*\S{5,18}$/

    if (!phoneRe.test(String(phoneNr.value))) {
        phoneNrHelp.classList.remove("valid")
        phoneNrHelp.classList.add("invalid")
        return true
    }
    else {
        phoneNrHelp.classList.remove("invalid")
        phoneNrHelp.classList.add("valid")

        return true
    }

}

function validateCountry() {

    if (country.value === "") {
        country.classList.remove("c_valid")
        country.classList.add("c_invalid")

        country.value = "Elukoha riik"
        return false
    }

    if (country.value) {
        country.classList.remove("c_invalid")
        country.classList.add("c_valid")


        return true
    }
}

function validateCity() {

    if (city.value === "") {
        city.classList.remove("c_valid")
        city.classList.add("c_invalid")

        return false
    }

    if (city.value) {
        city.classList.remove("c_invalid")
        city.classList.add("c_valid")

        return true
    }
}

function getAge(dob) {
    var today = new Date()
    var birthDate = new Date(dob)

    var age = today.getFullYear() - birthDate.getFullYear()
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
    }
    return age;
}

function styleGenderList(){
    gender.classList.remove("invalid")
    gender.options[3].classList.add("invalid")
}
