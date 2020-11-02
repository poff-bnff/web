
fetchMyPasses()

async function fetchMyPasses(){
    console.log('fetchMyPasses');
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage.getItem('ACCESS_TOKEN'));

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    let response = await fetch("https://api.poff.ee/product", requestOptions)

    console.log(await response.json());
}




// function loadUserPass() {
//     console.log('laen cognitost kasutaja passi andmed....')
//     var myHeaders = new Headers()
//     myHeaders.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'))

//     var requestOptions = {
//         method: 'GET',
//         headers: myHeaders,
//         redirect: 'follow'
//     }

//     fetch('https://api.poff.ee/product', requestOptions).then(function (response) {
//         if (response.ok) {
//             return response.json()
//         }
//         return Promise.reject(response)
//     }).then(function (data) {
//         let passInfo = data
//         useUserData(data)
//         console.log("cognitos olev passi info:")
//         console.log(passInfo)

//     }).catch(function (error) {
//         console.warn(error)
//     })
// }
// loeadUserInfo
// console.log(passInfo);

var qrcode = new QRCode("qrcode")

function makeCode () {
	qrcode.makeCode('elText.value')
}

makeCode()
