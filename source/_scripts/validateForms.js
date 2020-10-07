
function validateBDay() {
    var dob = document.getElementById("dob");
    //console.log(dob.value)
    var date = new Date
    var minAge = date.getMonth() + 1 + "-" + date.getDate() + "-" + (date.getFullYear() - 12);
    var maxAge = date.getMonth() + 1 + "-" + date.getDate() + "-" + (date.getFullYear() - 115);
    if (dob.value < minAge || dob.value > maxAge) {
        dob.classList.add("invalid");
    } else {
        dob.classList.remove("invalid");
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




