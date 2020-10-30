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
        city.value = linn
        country.value = riik
    }

    firstName.value = userProfile.name;
    lastName.value = userProfile.family_name;
    email.value = userProfile.email;
    gender.value = userProfile.gender;
    if (userProfile.phone_number) {
        phoneNr.value = userProfile.phone_number;
    }
    dob.value = userProfile.birthdate;
    if(userProfile.picture){
        // imgPreview.src = userProfile.picture
        console.log("profiili salvestatud pildi link on: " + userProfile.picture)

        showUserPicture(userProfile.picture)


        // imgPreview.src = "https://prod-poff-profile-pictures.s3.eu-central-1.amazonaws.com/helloo"
    }
}

async function showUserPicture(pictureUrl){
let pic = await fetch(pictureUrl)
console.log(pic);
}

//laeb ankeeti kasutaja juba sisestatud andmed ainult siis kui keegi on sisse loginud
if (localStorage.getItem("ACCESS_TOKEN")) {
    loadUserInfo();
}

async function sendUserProfile() {
    console.log('sending user profile.....');

    //küsib lingi kuhu pilti postitada
    let linkResponse = await fetch(`https://api.poff.ee/picture`, {

        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
        },
    });
    data = await linkResponse.json()
    //console.log("saadud link on: ")
    console.log(data.link)

    let pictureLink = ((await data.link).split('?'))[0]

    let userToSend = [
        { Name: "picture", Value: pictureLink },
        { Name: "name", Value: firstName.value },
        { Name: "family_name", Value: lastName.value },
        { Name: "gender", Value: gender.value },
        { Name: "birthdate", Value: dob.value },
        { Name: "phone_number", Value: phoneNr.value },
        { Name: "email", Value: email.value },
        { Name: "address", Value: `${country.value}, ${city.value}` },
    ];


//     //saadab pildi link-ile
//     var file = imgPreview.src;
//     console.log("file on...."+file);

//     SendImgToS3(data.link)

//     function SendImgToS3(myLink, myImg){

//         var requestOptions = {
//             method: 'PUT',
//             body: myImg,
//             redirect: 'follow'
//         };

//         fetch(myLink, requestOptions).then(function (response) {
//             if (response.ok) {
//                 console.log(response.json())
//                 return response.json();
//             }
//             return Promise.reject(response);
//         }).then(function (data) {
//             userProfile = data
//             console.log("cognitos olev profiil:")
//             console.log(userProfile);

//         }).catch(function (error) {
//             console.warn(error);
//         });

//     }


//     console.log("kasutaja profiil mida saadan");
//     console.log(userToSend)
//     let response = await (fetch(`https://api.poff.ee/profile`, {
    // saadab pildi link-ile
    var file = imgPreview.src;

    //console.log(file);

    var requestOptions = {
        method: 'PUT',
        body: file,
        redirect: 'follow'
    };

    fetch(data.link, requestOptions)

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
        window.open(localStorage.getItem('url'), '_self')
        localStorage.removeItem('url')

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

