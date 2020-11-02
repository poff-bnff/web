var imgPreview = document.getElementById("imgPreview");
var profileImg = document.getElementById("profileImg");

async function loadUserInfo() {
    let response = await fetch(`https://api.poff.ee/profile`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
        },
    });
    let userProfile = await response.json();

    if (userProfile.profile_filled) {
        document.getElementById('profileFilledMessage').style.display = 'block'
    } else {
        document.getElementById('profileUnFilledMessage').style.display = 'block'

    }
    console.log("täidan ankeedi " + userProfile.name + "-i cognitos olevate andmetega.....")
    if (userProfile.address) {
        let address = userProfile.address.split(", ")
        let riik = address[0]
        let linn = address[1]
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
    if(userProfile.picture) {
        fetch(userProfile.picture)
        .then(async function(response) {
            imgPreview.src = await response.text()
        })
    }

}

//laeb ankeeti kasutaja juba sisestatud andmed ainult siis kui keegi on sisse loginud
if (localStorage.getItem("ACCESS_TOKEN")) {
    loadUserInfo();
}

async function sendUserProfile() {
    console.log('updating user profile.....');

    let profile_pic_to_send= "no profile picture"
    alert("saadab profiili")

    if (imgPreview.src !== "/assets/img/static/Hunt_Kriimsilm_2708d753de.jpg"){
        //küsib lingi kuhu pilti postitada
        alert("küsib linki")
        let linkResponse = await fetch(`https://api.poff.ee/picture`, {

            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
            },
        });
        data = await linkResponse.json()
        //console.log("saadud link on: ")
        console.log(data.link)

        profile_pic_to_send = ((await data.link).split('?'))[0]

        var file = imgPreview.src;

        var requestOptions = {
            method: 'PUT',
            body: file,
            redirect: 'follow'
        };
        fetch(data.link, requestOptions)

    }


    let userToSend = [
        { Name: "picture", Value: profile_pic_to_send },
        { Name: "name", Value: firstName.value },
        { Name: "family_name", Value: lastName.value },
        { Name: "gender", Value: gender.value },
        { Name: "birthdate", Value: dob.value },
        { Name: "phone_number", Value: '+' + phoneNr.value },
        { Name: "email", Value: email.value },
        { Name: "address", Value: `${countrySelection.value}, ${citySelection.value}` },
    ];


    console.log("kasutaja profiil mida saadan");
    console.log(userToSend)
    let response = await (await fetch(`https://api.poff.ee/profile`, {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
        },
        body: JSON.stringify(userToSend)
    })).json()

    if (response.status) {
        document.getElementById('profileSent').style.display = 'block'
        if (localStorage.getItem('url')){
            window.open(localStorage.getItem('url'), '_self')
            localStorage.removeItem('url')
        }

    }

}


function readImage() {
    const fileSelector = document.getElementById("profileImg");
    const imgPreview = document.getElementById("imgPreview");
    let error = document.getElementById("imgError");

    fileSelector.addEventListener("change", (event) => {
        const fileList = event.target.files;
        //console.log(fileList);
        for (const file of fileList) {
            // Not supported in Safari for iOS.
            const name = file.name ? file.name : "NOT SUPPORTED";
            // Not supported in Firefox for Android or Opera for Android.
            const type = file.type ? file.type : "NOT SUPPORTED";
            // Unknown cross-browser support.
            const size = file.size ? file.size : "NOT SUPPORTED";
            console.log({ file, name, type, size });
            error.innerHTML = "";
            // Check if the file is an image.
            if (file.type && file.type.indexOf("image") === -1) {
                console.log("File is not an image.", file.type, file);
                error.innerHTML = "File is not an image.";
                return;
            }
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                imgPreview.src = event.target.result;
            });
            reader.readAsDataURL(file);
        }
    });
}



function validateForm() {

    var errors = []

    if (document.getElementById('profileSent')) {
        document.getElementById('profileSent').style.display = 'none'
    }

    if (!validateEmail('email')) {
        errors.push('Missing or invalid email')
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
        sendUserProfile()
    }
}

