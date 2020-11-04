if (localStorage.getItem("ACCESS_TOKEN")) {
    loadUserInfo();
}

async function loadUserInfo() {
    let response = await fetch(`https://api.poff.ee/profile`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
        },
    });
    let userProfile = await response.json();

    console.log('userProfile', userProfile)
    if (userProfile.address) {
        let address = userProfile.address.split(", ")
        let riik = address[0]
        let linn = address[1]
        console.log(riik)
        console.log(linn)
        citySelection.value = linn
        countrySelection.value = riik
    }

    firstName.value = userProfile.name;
    lastName.value = userProfile.family_name;
    email.value = userProfile.email;
    gender.value = userProfile.gender;
    if (userProfile.phone_number) {
        phoneNr.value = userProfile.phone_number;
    }
    dob.value = userProfile.birthdate;

    pswds.style.display = 'none'
}



async function sendNewUser() {
    console.log('sending new user profile.....');

    let profile_pic_to_send= "no profile picture"

    if (!imgPreview.src.search("/assets/img/static/Hunt_Kriimsilm_2708d753de.jpg")){
        profile_pic_to_send=imgPreview.src
    }

    let userToSend = [
        { Name: "picture", Value: profile_pic_to_send },
        { Name: "email", Value: email.value },
        { Name: "name", Value: firstName.value },
        { Name: "family_name", Value: lastName.value },
        { Name: "gender", Value: gender.value },
        { Name: "birthdate", Value: dob.value },
        { Name: "phone_number", Value: '+' + phoneNr.value },
        { Name: "address", Value: `${countrySelection.value}, ${citySelection.value}` },
        { Name: "password", Value: psw.value }
    ];

    console.log(userToSend);

    let response = await fetch(`https://api.poff.ee/profile`, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
        },
        body: JSON.stringify(userToSend)
    });
    response = await response.json()

    console.log(response.UserConfirmed)
    if (!response.UserConfirmed){
        console.log('if');
    document.getElementById('profileSent').style.display = 'block'
    document.getElementById('profileSent').innerHTML = 'Andmed salvestatud, kinnituslink saadetud aadressile ' + email.value
    document.getElementById('loginButton').style.display = 'block'

    // window.open(`${pageURL}/login`, '_self')
    }
}

const fileSelector = document.getElementById('profileImg');
fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    //console.log(fileList);
    for (const file of fileList) {
        // Not supported in Safari for iOS.
        const name = file.name ? file.name : 'NOT SUPPORTED';
        // Not supported in Firefox for Android or Opera for Android.
        const type = file.type ? file.type : 'NOT SUPPORTED';
        // Unknown cross-browser support.
        const size = file.size ? file.size : 'NOT SUPPORTED';
        console.log({ file, name, type, size });
        readImage(file)
    }
});

function readImage(file) {
    const output = document.getElementById("imgPreview");
    let error = document.getElementById("imgError");
    error.innerHTML = ''
    // Check if the file is an image.
    if (file.type && file.type.indexOf('image') === -1) {
        console.log('File is not an image.', file.type, file);
        error.innerHTML = 'File is not an image.'
        return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        output.src = event.target.result;

    });
    reader.readAsDataURL(file);
}


function validateForm() {

    var errors = []

    if (document.getElementById('profileSent')){
    document.getElementById('profileSent').style.display = 'none'
    }

    if (!validateEmail("email")) {
        errors.push('Missing or invalid email')

    }
    if (psw && !validatePsw("psw")) {
        errors.push('Missing or invalid password')
    }

    if (psw2 && !validatePswRep("psw", "psw2")) {
        errors.push('Missing or invalid password repeat')
    }

    if (!validateFirstName("firstName")) {
        errors.push('Missing firstname')
    }

    if (!validateLastName("lastName")) {
        errors.push('Missing lastname')
    }

    if (!validateGender("gender")) {
        errors.push('Missing gender')
    }

    if (!validateBDay("dob")) {
        errors.push('Missing or invalid date of birth')
    }

    if (!validatePhoneNr("phoneNr")) {
        errors.push('Missing phonenumber')
    }

    if (!validateCountry("countrySelection")) {
        errors.push('Missing country')
    }

    if (!validateCity("citySelection")) {
        errors.push('Missing city')
    }

    console.log(errors)
    if (errors.length === 0) {
        sendNewUser()
    }
}



// console.log(output.src)



