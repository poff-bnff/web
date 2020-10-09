
var firstName = document.getElementById("firstName");
var lastName = document.getElementById("lastName");
var gender = document.getElementById("gender");
var dob = document.getElementById("dob");
var phoneNr = document.getElementById("phoneNr");
var email = document.getElementById("email");
var country = document.getElementById("countrySelection");
var city = document.getElementById("gds-cr-one");

function validateForm() {
    console.log("validate form");

    if (country == "") {
        console.log(country.value, " countryif");
        country.classList.add("invalid");
        country.value = "Elukoha riik";
    }
    if (firstName.value == "" || firstName.value.length < 2 || !isNaN(firstName.value)) {
        firstName.classList.add("invalid");
    }
    if (lastName.value == "" || lastName.value.length < 2 || !isNaN(lastName.value)) {
        lastName.classList.add("invalid");
    }
    if (city == "") {
        city.classList.add("invalid");
    }
}




function validateBDay() {
    var dob = document.getElementById("dob");
    //console.log(dob.value)
    var date = new Date
    var minAge = date.getMonth() + 1 + "-" + date.getDate() + "-" + (date.getFullYear() - 12);
    var maxAge = date.getMonth() + 1 + "-" + date.getDate() + "-" + (date.getFullYear() - 115);
    console.log('maxAge :', maxAge);
    console.log('minAge :', minAge);
    console.log(typeof dob.value);
    console.log(typeof maxAge);
    console.log(typeof minAge);
    console.log('minage ', dob.value < minAge);
    console.log('maxage ', dob.value > maxAge);
    if (dob.value < minAge && dob.value > maxAge) {
        dob.classList.remove("invalid");
    } else {
        dob.classList.add("invalid");
    }
}

function validatePsw(){
    var psw = document.getElementById("psw");
    var psw2 = document.getElementById("psw2");
    if(psw.value !== psw2.value){
        psw2.classList.add("invalid")
    }else{
        psw2.classList.remove("invalid")
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

function validatePhoneNr() {
    var phoneNr = document.getElementById("phoneNr");
    var regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]*$/;
    console.log(regex.test(String(phoneNr.value).toLowerCase()));
}




