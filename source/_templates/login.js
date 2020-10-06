// const ACCESS_TOKEN = "ACCESS_TOKEN";
// const ID_TOKEN = "ID_TOKEN";
// // const REFRESH_TOKEN = "REFRESH_TOKEN";
// let url = window.location;
// console.log(url)

// // let pageURL = 'https://dev.inscaping.eu'
// // let userprofilePageURL = pageURL + '/userprofile/'

// // let pageURL = 'http://localhost:4000'
// // let userprofilePageURL = pageURL + '/userprofile'

// let pageURL = "http://localhost:5000";
// let userprofilePageURL = pageURL + "/userprofile";

// async function loadUserProfile() {
//     let USER_PROFILE = {}
//     console.log("loadUserProfile");

//     let response = await fetch(`https://api.poff.ee/profile`, {
//         method: "GET",
//         headers: {
//             Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
//         },
//     });
//     USER_PROFILE = await response.json();
//     console.log("USER_PROFILE in header: " + JSON.stringify(USER_PROFILE));

//     console.log(USER_PROFILE);

//     //ta peaks seda üks kord tegema, muidu inimene jääb kinni??

//     if (ACCESS_TOKEN && USER_PROFILE.profile_filled) {
//         console.log("profile filled");
//     } else {
//         if (window.location.href != userprofilePageURL) {
//             window.open(`${pageURL}/userprofile`, "_self");
//         }
//     }
// }

// loadUserProfile();

// if (window.location.hash) {
//     const [
//         access_token,
//         id_token,
//         token_type,
//         token_expires,
//     ] = window.location.hash.substr(1).split("&");

//     if (access_token && id_token) {
//         storeAuthentication(access_token.split("=")[1], id_token.split("=")[1]);
//     } else {
//         console.log("Not sent ");
//     }
// }

// async function storeAuthentication(access_token, id_token) {
//     console.log("storeauth");
//     localStorage.setItem(ACCESS_TOKEN, access_token);
//     localStorage.setItem(ID_TOKEN, id_token);
//     window.location.hash = "";

//     if (localStorage.getItem("url")) {
//         let url = localStorage.getItem("url");
//         window.open(url, "_self");
//     } else {
//         location.reload();
//     }
// }


// // function logOut() {
// //     localStorage.removeItem(ACCESS_TOKEN);
// //     localStorage.removeItem(REFRESH_TOKEN);
// //     localStorage.removeItem(ID_TOKEN);
// //     console.log('LOGITUD VÄLJA');
// //     location.reload();
// // }
