let imgPreview = document.getElementById("imgPreview");
let profile_pic_to_send = "no profile picture saved"

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

    // kui kasutajal on pilt salvestatud
    // if(userProfile.picture !=="no profile picture saved") {
    // }
        let res = await fetch(`https://api.poff.ee/profile/picture`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
            },
        });
        let profilePicture = await res.json();
        console.log(profilePicture.url)

        imgPreview.src=profilePicture.url
}

if (localStorage.getItem("ACCESS_TOKEN")) {
    loadUserInfo();
}

async function sendUserProfile() {
    console.log('updating user profile.....');
    let picture = 'no profile picture saved'
    if(profile_pic_to_send !== "no profile picture saved"){
        picture ='this users pic is in S3'
    }

    let userToSend = [
        {Name: "picture",Value: picture },
        {Name: "name",Value: firstName.value},
        {Name: "family_name", Value: lastName.value },
        {Name: "gender",Value: gender.value},
        { Name: "birthdate",Value: dob.value},
        {Name: "phone_number",Value: '+' + phoneNr.value},
        {Name: "email",Value: email.value},
        {Name: "address",Value: `${countrySelection.value}, ${citySelection.value}`},
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
        if (localStorage.getItem('url')) {
            window.open(localStorage.getItem('url'), '_self')
            localStorage.removeItem('url')
        }

    }

}


function validateaAndPreview(file) {
    let error = document.getElementById("imgError");
    console.log(file)
    // Check if the file is an image.
    if (!file.type.includes("image")) {
        console.log("File is not an image.", file.type, file);
        error.innerHTML = "File is not an image.";
    } else {
        //näitab pildi eelvaadet
        var reader = new FileReader();
        reader.onload = function () {
            imgPreview.src = reader.result;
        };
        reader.readAsDataURL(file);
        profile_pic_to_send = file
    }
}

async function uploadPic() {
    //küsib lingi
    if (imgPreview.src !== "/assets/img/static/Hunt_Kriimsilm_2708d753de.jpg") {
        //küsib lingi kuhu pilti postitada
        let linkResponse = await fetch(`https://api.poff.ee/picture`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
            },
        });
        data = await linkResponse.json()
        console.log("saadud link on: ")
        console.log(data.link)

        console.log("uploading this file to S3....")
        console.log(profile_pic_to_send)

        //saadab pildi
        let requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': "image/png",
                'ACL': 'private'
            },
            body: profile_pic_to_send,
            redirect: 'follow'
        };
        fetch(data.link, requestOptions)

    }

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
