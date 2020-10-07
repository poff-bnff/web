let profileImg = document.getElementById("profileImg");
let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let gender = document.getElementById("gender");
let dob = document.getElementById("dob");
let phoneNr = document.getElementById("phoneNr");
let email = document.getElementById("email");
let country = document.getElementById("country");
let city = document.getElementById("city");

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

async function LoadUserInfo() {
    let response = await fetch(`https://api.poff.ee/profile`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
        },
    });
    let userProfile = await response.json();

    firstName.value = userProfile.name;
    lastName.value = userProfile.family_name;
    email.value = userProfile.email;
    //console.log(userProfile)
}

//laeb ankeeti kasutaja juba sisestatud andmed ainult siis kui keegi on sisse loginud
if (localStorage.getItem("ACCESS_TOKEN")) {
    LoadUserInfo();
}

async function sendUserProfile() {
    //siin panen kokku listi objektidest mida saata cognitosse
    //Kas järjekord on oluline?
    //kas Name-id on kõik õiged?
    let userToSend = [
        { Name: "picture", Value: imgPreview.src },
        { Name: "name", Value: firstName.value },
        { Name: "family_name", Value: lastName.value },
        { Name: "gender", Value: gender.value },
        { Name: "birthdate", Value: dob.value },
        { Name: "phone_number", Value: phoneNr.value },
        { Name: "email", Value: email.value },
        { Name: "address", Value: `${country.value}, ${city.value}` },
    ];

    console.log(userToSend);

    let response = await fetch(`https://api.poff.ee/profile`, {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')},
            body: JSON.stringify(userToSend)
        });
        userProfile = await response.json()
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

