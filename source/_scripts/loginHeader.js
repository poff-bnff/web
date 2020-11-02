// var pageURL = 'https://dev.inscaping.eu'
// var userprofilePageURL = pageURL + '/userprofile/'s

var pageURL = 'http://localhost:4000'
var userprofilePageURL = pageURL + '/userprofile'

// var pageURL = 'http://localhost:5000';
// var userprofilePageURL = pageURL + '/userprofile';

var userProfile

if (localStorage.getItem('ID_TOKEN') !== null){
    document.getElementById('logOut').style.display = 'block'
    document.getElementById('logInName').style.display = 'block'
    document.getElementById('myFavouriteFilms').style.display = 'block'
    document.getElementById('userProfile').style.display = 'block'

    loadUserProfileH()
}

if (localStorage.getItem('ID_TOKEN') === null){
    document.getElementById('logIn').style.display = 'block'
    document.getElementById('signUp').style.display = 'block'
}


function loadUserProfileH() {
    console.log('laen cognitost kasutaja profiili....')
    var myHeaders = new Headers()
    myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'))


    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }


    fetch('https://api.poff.ee/profile', requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        userProfile = data
        useUserData(data)
        console.log("cognitos olev profiil:")
        console.log(userProfile);

    }).catch(function (error) {
        console.warn(error);
    });

}


function saveUrl(){
    localStorage.setItem('url', window.location.href)
}


function useUserData(userProf){
    document.getElementById('logInName').innerHTML = 'Tere, ' + userProf.name
}




function logOut() {
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('ID_TOKEN')

    if (localStorage.getItem('REFRESH_TOKEN')){
        localStorage.removeItem('REFRESH_TOKEN')
    }
    localStorage.removeItem('url')
    localStorage.removeItem('USER_PROFILE')

    console.log('LOGITUD VÄLJA')
    location.reload()
}

//user profile-i kokku panemine võiks toimuda

// function MakeProfile(){

//     console.log('making user profile.....');
//     //profiili pilti üritab salvestada ainult kui pole kriimsilm
//     var pictureLink= "no profile picture"

//     if (!imgPreview.src.search("/assets/img/static/Hunt_Kriimsilm_2708d753de.jpg")){
//         //küsib lingi kuhu pilti postitada
//         GetS3Link()
//         PostPicToS3()
//     }


//             function GetS3Link(){
//                 // let linkResponse = await fetch(`https://api.poff.ee/picture`, {
//                 //     method: 'GET',
//                 //     headers: {
//                 //         Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
//                 //     },
//                 // });
//                 // data = await linkResponse.json()

//                 // // console.log("saadud link on: ")
//                 // // console.log(data.link)

//                 // pictureLink = ((await data.link).split('?'))[0]
//                 return "link"
//             }

//             //postitab pildi S3-e
//             function PostPicToS3(){
//                 // var file = imgPreview.src;
//                 // var requestOptions = {
//                 //     method: 'PUT',
//                 //     body: file,
//                 //     redirect: 'follow'
//                 // };
//                 // fetch(data.link, requestOptions)
//             }

//     var userToSend = [
//         { Name: "picture", Value: pictureLink },
//         { Name: "name", Value: firstName.value },
//         { Name: "family_name", Value: lastName.value },
//         { Name: "gender", Value: gender.value },
//         { Name: "birthdate", Value: dob.value },
//         { Name: "phone_number", Value: '+' + phoneNr.value },
//         { Name: "email", Value: email.value },
//         { Name: "address", Value: `${countrySelection.value}, ${citySelection.value}` },
//     ];
//     if(psw.value){
//         userToSend.append({ Name: "password", Value: psw.value })
//     }

//     return userToSend

// }
