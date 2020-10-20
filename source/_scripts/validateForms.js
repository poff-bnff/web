var email = document.getElementById("email");
var psw = document.getElementById("psw");
var psw2 = document.getElementById("psw2");
var firstName = document.getElementById("firstName");
var lastName = document.getElementById("lastName");
var gender = document.getElementById("gender");
var dob = document.getElementById("dob");
var phoneNr = document.getElementById("phoneNr");
var country = document.getElementById("countrySelection");
var city = document.getElementById("gds-cr-one");



function validateForm() {

    var errors = []

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
        email.classList.remove("valid")
        email.classList.add("invalid")
        return false
    }
    else {
        email.classList.remove("invalid")
        email.classList.add("valid")


        return true
    }
}

function validatePsw() {

    if (psw.value === "") {
        psw.classList.remove("valid")
        psw.classList.add("invalid")
        validatePswRep()
        return false
    }

    var pswdRe = /^(?=.*[a-z])(?=.*[A-Z])\S{8,99}$/

    if (!pswdRe.test(String(psw.value))) {
        psw.classList.remove("valid")
        psw.classList.add("invalid")
        validatePswRep()
        return true
    }
    else {
        psw.classList.remove("invalid")
        psw.classList.add("valid")
        validatePswRep()
        return true
    }
}

function validatePswRep() {
    if (psw2.value === "") {
        psw2.classList.remove("valid")
        psw2.classList.add("invalid")
        return false
    }

    if (psw.value !== psw2.value) {
        psw2.classList.remove("valid")
        psw2.classList.add("invalid")
        return false
    } else {
        psw2.classList.remove("invalid")
        psw2.classList.add("valid")

        return true
    }
}

function validateFirstName() {

    if (firstName.value == "" || firstName.value.length < 2 || !isNaN(firstName.value)) {
        firstName.classList.remove("valid")
        firstName.classList.add("invalid")
        return false
    }
    firstName.classList.remove("invalid")
    firstName.classList.add("valid")

    return true
}

function validateLastName() {

    if (lastName.value === "" || lastName.value.length < 2 || !isNaN(lastName.value)) {
        lastName.classList.remove("valid")
        lastName.classList.add("invalid")
        return false
    }
    lastName.classList.remove("invalid")
    lastName.classList.add("valid")

    return true
}


function validateGender() {

    if (gender.value === "") {
        gender.classList.remove("valid")
        gender.classList.add("invalid")
        return false
    }

    if (gender.value !== "") {
        gender.classList.remove("invalid")
        gender.classList.add("valid")

        return true
    }
}

function validateBDay() {
    if (dob.value === "") {
        dob.classList.remove("valid")
        dob.classList.add("invalid")
        return false
    }

    var userAge = getAge(dob.value)

    if (userAge > 12 && userAge < 116) {
        dob.classList.remove("invalid")
        dob.classList.add("valid")

        return true
    } else {
        dob.classList.remove("valid")
        dob.classList.add("invalid")

        return false
    }
}

function validatePhoneNr() {
    if (phoneNr.value === "") {
        phoneNr.classList.remove("valid")
        phoneNr.classList.add("invalid")
        return false
    }

    var phoneRe = /^[+]{1,4}[)]?[-\s0-9]*$/

    if (!phoneRe.test(String(phoneNr.value))) {
        phoneNr.classList.remove("valid")
        phoneNr.classList.add("invalid")
        return true
    }
    else {
        phoneNr.classList.remove("invalid")
        phoneNr.classList.add("valid")
        return true
    }

}

function validateCountry() {

    if (country.value === "") {
        country.classList.remove("valid")
        country.classList.add("invalid")
        country.value = "Elukoha riik"
        return false
    }

    if (country.value) {
        country.classList.remove("invalid")
        country.classList.add("valid")

        return true
    }
}

function validateCity() {

    if (city.value === "") {
        city.classList.remove("valid")
        city.classList.add("invalid")
        return false
    }

    if (city.value) {
        city.classList.remove("invalid")
        city.classList.add("valid")

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
