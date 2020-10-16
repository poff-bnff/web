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
    console.log("validate form");

    validatePassword()

    var errors = []

    if (email.value === "") {
        email.classList.add("invalid")
        errors.push('Missing email')
    }

    if (psw.value === '' || !validatePsw()) {
        email.classList.add("invalid")
        errors.push('Missing or invalid password')
    }


    if (firstName.value == "" || firstName.value.length < 2 || !isNaN(firstName.value)) {
        firstName.classList.add("invalid")
        errors.push('Missing firstname')
    }

    if (lastName.value == "" || lastName.value.length < 2 || !isNaN(lastName.value)) {
        lastName.classList.add("invalid")
        errors.push('Missing lastname')
    }

    if (gender.value === "") {
        gender.classList.add("invalid")
        errors.push('Missing gender')
    }

    if (dob.value === "" || !validateBDay()) {
        dob.classList.add("invalid")
        errors.push('Missing or invalid date of birth')
    }

    if (phoneNr.value === "") {
        phoneNr.classList.add("invalid")
        errors.push('Missing phonenumber')
    }

    if (country.value === "") {
        console.log(country.value, " countryif")
        country.classList.add("invalid")
        country.value = "Elukoha riik"
        errors.push('Missing country')
    }

    if (city.value === "") {
        city.classList.add("invalid")
        errors.push('Missing city')
    }


    console.log(errors);
    if (errors.length === 0) {

        if (window.location.href === userprofilePageURL) {
            sendUserProfile()
        } else {
            sendNewUser()
        }
    }
}

    function getAge(dob) {
        console.log('getAge')
        var today = new Date()
        var birthDate = new Date(dob)

        var age = today.getFullYear() - birthDate.getFullYear()
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age = age - 1;
        }
        return age;
    }

    function validateBDay() {
        var userAge = getAge(dob.value)

        if (userAge > 12 && userAge < 116) {
            dob.classList.remove("invalid")
            return true
        } else {
            dob.classList.add("invalid")
            return false
        }
    }

    function validatePsw() {
        if (psw.value !== psw2.value) {
            psw2.classList.add("invalid")
            return false
        } else {
            psw2.classList.remove("invalid")
            return true
        }
    }

    function validateEmail() {
        var email = document.getElementById("email");
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //console.log(re.test(String(email.value).toLowerCase()));
        if (!re.test(String(email.value).toLowerCase())) {
            email.classList.add("invalid");
        } else {
            email.classList.remove("invalid");
        }
    }

    function validatePassword(){
        var re = /^(?=.*[a-z])(?=.*[A-Z])\S{8,99}$/
        console.log((re.test(psw)))
    }

    function validatePhoneNr() {
        var phoneNr = document.getElementById("phoneNr");
        var regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]*$/;
        console.log(regex.test(String(phoneNr.value).toLowerCase()));
    }

    function validateCountry() {
        if (country.value) {
            country.classList.remove("invalid")
        }
    }

    function validateCity() {
        if (city.value) {
            city.classList.remove("invalid")
        }
    }




